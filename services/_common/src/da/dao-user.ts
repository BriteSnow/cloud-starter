// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/services/_common/src/da/dao-user.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

/////////////////////
// User DAO. Advanced DAO to manage the security aspect of the user. 
////

import { GlobalAccess, GlobalAccesses, GlobalRoleName, GLOBAL_ROLES, isAccess } from '#shared/access-types.js';
import { QueryOptions, User, USER_COLUMNS } from "#shared/entities.js";
import { CODE_ERROR } from '../error-common.js';
import { Err } from '../error.js';
import { pwdEncrypt } from '../security/password.js';
import { UserContext } from "../user-context.js";
import { symbolDic } from '../utils.js';
import { AccessRequires } from "./access.js";
import { BaseDao } from "./dao-base.js";
import { knexQuery } from './db.js';

const ERROR = symbolDic(
	'NO_USER_FOUND'
);

/* Data needed for authentication */
export interface UserCredForAuth extends Pick<User, 'id' | 'username'> {
	uuid: string;
	tsalt: string;
	accesses: GlobalAccesses;
}

/* Data needed for login (auth plus password info*/
export interface UserCredForLogin extends UserCredForAuth {
	pwd: string;
	psalt: string;
}

interface CreateUserData {
	username: string;
	clearPwd: string;
	role?: GlobalRoleName
}

// To allow checking or deleting these properties for regular apis
const USER_SECURITY_COLUMNS = Object.freeze(['pwd', 'psalt', 'tsalt']);


// For auth only
const USER_COLUMNS_FOR_AUTH = Object.freeze(['id', 'uuid', 'username', 'role', 'accesses', 'tsalt']);

// For login only (export for agent)
export const USER_COLUMNS_FOR_LOGIN = Object.freeze([...USER_COLUMNS_FOR_AUTH, 'pwd', 'psalt']);


// User identifier of a user
const USER_KEYS = Object.freeze(['id', 'uuid', 'username'] as const);
type UserKeyName = typeof USER_KEYS[number]; // 'id' | 'uuid' | 'username'
type UserKey = Partial<Pick<User, UserKeyName>>; // Note: should be one of, but not available in TS

export class UserDao extends BaseDao<User, number, QueryOptions<User>>{
	constructor() {
		// Note: need to clone user_columns to make it mutable, per BaseDao
		super({ table: 'user', stamped: true, columns: [...USER_COLUMNS] });
	}

	async getUserByUserName(utx: UserContext, username: string): Promise<User | null> {
		return this.first(utx, { username });
	}

	//#region    ---------- BaseDao Overrides ---------- 
	async create(utx: UserContext, data: Partial<User>) {
		throw new Err(CODE_ERROR, 'UserDao.create not implemented by design. Use UserDao.createUser');
		return -1; // for TS.
	}

	@AccessRequires()
	async remove(utx: UserContext, id: number | number[]) {
		return super.remove(utx, id);
	}

	@AccessRequires('a_admin_edit_user', '@id')
	async update(utx: UserContext, id: number, data: Partial<User>) {
		throw new Error('UserDao.update NOT AVAILABLE, use UserDao.updateUser');
		return -1; // for TS.
	}
	//#endregion ---------- /BaseDao Overrides ---------- 

	//#region    ---------- Query Override ---------- 
	/**
	 * Double precaution to make sure '.pwd' and '.key' are removed.
	 * Note: Here we log a code error so that we can fix the code approrietaly.
	 * @param user 
	 */
	parseRecord(user: User) {
		// Check that we do not expose the security columns
		for (const col of USER_SECURITY_COLUMNS) {
			if ((<any>user)[col] !== undefined) {
				delete (<any>user)[col];
				console.log(`CODE ERROR - RECOVERED - UserDao processEntity had to remove '.${col}' for safety. Call completeQueryBuildWithQueryOptions.`)
			}
		}
		return user;
	}
	//#endregion ---------- /Query Override ---------- 

	//#region    ---------- Credential Methods ---------- 
	async createUser(utx: UserContext, data: CreateUserData) {
		const { username, clearPwd, role } = data;

		// first we create the new user
		const { query } = await knexQuery({ utx, tableName: this.table });
		// stamp manually since the 'role' is not part of the User type (by design, not needed, need to make sure accesses is used)

		const dataUser = BaseDao.Stamp(utx, { username, role }, true);
		// NOTE: By default, thereturning this.idNames is .id
		const userId = (await query.insert(dataUser).returning(this.idNames as 'id'))[0].id as number;

		// then we set the new password (for create, no need to reset psalt or tsalt)
		await this.setPwd(utx, { id: userId }, clearPwd, false, false);
		// return the userId
		return userId;
	}

	/**
	 * Set the encrypted password from a clear password with current psalt and encryption scheme. 
	 * 
	 * By default will reset `.psalt`, and `.tsalt` (the later will cause all login to be invalid)
	 * 
	 * @param utx 
	 * @param userKey Object containing id, uuid, or username. (only one)
	 * @param clearPwd 
	 * @param resetTSalt default true
	 * @param resetPSalt default true
	 */
	@AccessRequires('a_admin_edit_user', '@id')
	async setPwd(utx: UserContext, userKey: UserKey, clearPwd: string, resetTSalt = true, resetPSalt = true) {
		checkUserKey(userKey);
		//// reset psalt if set to reset
		if (resetPSalt) {
			const { query } = await knexQuery({ utx, tableName: this.table });
			await query.update({ psalt: query.client.raw('gen_random_uuid()') }).where(userKey);
		}
		//// get user credential for create, and create new password
		const userCred = await this.getUserCredForCreate(utx, userKey);
		const { uuid, psalt } = userCred;
		const pwd = pwdEncrypt({ uuid, psalt, clearPwd });

		//// update user pwd, and eventually tsalt if set to true above
		const { query } = await knexQuery({ utx, tableName: this.table });
		const data: { pwd: string, tsalt?: any } = { pwd };
		if (resetTSalt) {
			data.tsalt = query.client.raw('gen_random_uuid()');
		}
		await query.update(data).where(userKey);
	}



	@AccessRequires() // only allow sysCtx
	async getUserCredForAuth(utx: UserContext, key: UserKey): Promise<UserCredForAuth> {
		// Note: can force the return type as per columns
		return this.getUserCred(utx, USER_COLUMNS_FOR_AUTH, key) as Promise<UserCredForAuth>;
	}

	@AccessRequires() // only allow sysCtx
	async getUserCredForLogin(utx: UserContext, key: UserKey): Promise<UserCredForLogin> {
		// Note: can force the return type as per columns
		return this.getUserCred(utx, USER_COLUMNS_FOR_LOGIN, key) as Promise<UserCredForLogin>;
	}

	@AccessRequires() // only allow sysCtx
	async getUserCredForCreate(utx: UserContext, key: UserKey): Promise<UserCredForLogin> {
		// Note: can force the return type as per columns
		return this.getUserCred(utx, USER_COLUMNS_FOR_LOGIN, key) as Promise<UserCredForLogin>;
	}

	// Note: Only to be used in the getUserCred... context of dao-user
	private async getUserCred(utx: UserContext, columns: readonly string[], key: UserKey): Promise<UserCredForAuth | UserCredForLogin> {
		const { query } = await knexQuery({ utx, tableName: this.table });

		// make sure it is only the key only has one of those three
		checkUserKey(key);

		// make sure key is only one property
		query.limit(1);
		query.columns(columns);
		query.where(key);
		const result = await query;

		if (result.length == 0) {
			throw new Err(ERROR.NO_USER_FOUND)
		}

		const rawUserObj = result[0];
		rawUserObj.accesses = UserDao.parseAccess(rawUserObj);

		// Note: assume columns are correct
		return Object.freeze(rawUserObj) as UserCredForLogin | UserCredForAuth;
	}
	//#endregion ---------- /Credential Methods ---------- 

	static parseAccess(rawUserObj: { role: GlobalRoleName, accesses?: string[] }): Readonly<{ [key in GlobalAccess]?: true }> {
		const { role, accesses } = rawUserObj;

		// temporarely store the data in a set (best container for the work)
		const userAccesses = new Set<GlobalAccess>();

		// process the roles
		GLOBAL_ROLES.get(role)?.forEach(a => userAccesses.add(a))

		// process accessModifier (accessRule is 'accessname' or '!accessname')
		if (accesses) {
			for (const accessModifier of accesses) {
				let accessName = accessModifier;
				let negate = false;
				if (accessModifier.startsWith('!')) {
					accessName = accessModifier.substring(1);
					negate = true;
				}
				if (isAccess(accessName)) {
					if (negate) {
						userAccesses.delete(accessName);
					} else {
						userAccesses.add(accessName);
					}
				} else {
					console.log(`CODE ERROR - IGNORE - ${accessName} if not a valid GLOBAL_ACCESSES.`);
				}
			}
		}


		// build the object {[key in GlobalAccess]: true} for pervasive code access. 
		return Object.freeze(Array.from(userAccesses.values())
			.reduce((acc, val) => { acc[val] = true; return acc },
				{} as { [key in GlobalAccess]?: true }));
	}


}

//#region    ---------- Utils ---------- 
/** 
 * Validate the user key is one of username?, id?, or uuid? 
 * 
 * Note: here we do not use the assertUserKey pattern, even if checkUserKey is very close because
 *       this check goes a little bit further, and check that there are only one property defined (not expressed in typescript type)
 **/
function checkUserKey(key: UserKey) {
	const keys = Object.keys(key);
	if (keys.length != 1) {
		throw new Err(CODE_ERROR, `getUserCred key has too many properties ${Object.keys(key).length}`)
	}

	// NOTE: downcast here to be able to do the hard check
	const user_keys = (<unknown>USER_KEYS) as string[];
	if (!user_keys.includes(keys[0])) {
		throw new Err(CODE_ERROR, `invalid user key ${keys[0]} should be one of ${USER_KEYS}`);
	}
}
//#endregion ---------- /Utils ----------