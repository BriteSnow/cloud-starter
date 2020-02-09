// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/services/common/src/da/dao-user.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { QueryOptions, User, UserType } from "shared/entities";
import { Context, newContext } from "../context";
import { AppError } from "../error";
import { createSalt, uuidV4 } from '../security/generators';
import { pwdEncrypt } from '../security/password';
import { PwdEncryptData } from '../security/password-types';
import { AccessRequires } from "./access";
import { BaseDao } from "./dao-base";
import { getKnex } from "./db";

interface UserCredential extends Pick<User, 'username'> {
	salt: string;
	uuid: string;
	pwd: string;
}

export interface UserAuthCredential extends UserCredential, Pick<User, 'id' | 'type'> {
	key: string
};


interface CreateUserData {
	type?: UserType;
	username: string;
	clearPwd: string;
}


// default user columns for users
const USER_COLUMNS = ['id', 'uuid', 'username', 'type', 'cid', 'ctime', 'mid', 'mtime'];

// Security only columns, only to be used in getUserAuthCredential, 
const USER_SECURITY_COLUMNS = ['salt', 'key', 'pwd'];

// Credential for authentication
const USER_AUTH_CREDENTIAL_COLUMNS = ['id', 'uuid', 'username', 'type', ...USER_SECURITY_COLUMNS];


export class UserDao extends BaseDao<User, number, QueryOptions<User>>{
	constructor() {
		super({ table: 'user', stamped: true, columns: USER_COLUMNS });
	}

	async getUserByUserName(ctx: Context, username: string): Promise<User | null> {
		return this.first(ctx, { username });
	}

	//#region    ---------- BaseDao Overrides ---------- 
	async create(ctx: Context, data: Partial<User>) {
		throw new Error('UserDao.create NOT AVAILABLE, use UserDao.createUser');
		return -1; // for TS.
	}

	@AccessRequires(['#sys', '#admin'])
	async remove(ctx: Context, id: number | number[]) {
		return super.remove(ctx, id);
	}

	@AccessRequires(['#sys', '#admin', '@id'])
	async update(ctx: Context, id: number, data: Partial<User>) {
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
	processEntity(user: User) {
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
	async createUser(ctx: Context, data: CreateUserData) {
		const userCredential = newUserCredential(data.username, data.clearPwd);
		const type = data.type;
		return await super.create(ctx, { ...userCredential, type });
	}


	@AccessRequires(['#sys'])
	async newContextFromUserId(ctx: Context, userId: number) {
		const user = await this.get(ctx, userId);
		return newContext(user);
	}

	/** 
	 * Return a user credential necessary to authenticate a user (.id, .username, .uuid, .salt, .pwd, .key). 
	 * IMPORTANT: This is the ONLY methods that should return the 'user.pwd' and 'user.key'
	 * IMPORTANT: This is only to be used for login password check, and request authentication.
	 **/
	@AccessRequires(['#sys']) // here only sys context should be able to call this one
	async getUserAuthCredential(ctx: Context, ref: number | string): Promise<UserAuthCredential> {
		const k = await getKnex();
		let q = k(this.tableName);
		q.limit(1);
		q.columns(USER_AUTH_CREDENTIAL_COLUMNS);
		const colName = (typeof ref === 'string') ? 'username' : 'id';
		const result = await q.where(colName, ref);
		if (!result || result.length < 1) {
			throw new AppError(`Cannot find userWithCredential for ${ref}`);
		}
		return result[0] as UserAuthCredential;
	}
	//#endregion ---------- /Credential Methods ---------- 
}


//#region    ---------- Utils ---------- 

/**
 * Create a new uuid, salt, and pwd given a username and clearPwd.
 * 
 * Use by registration and agent `npm run credential admin welcome` commands
 */
export function newUserCredential(username: string, clearPwd: string): UserCredential {
	const uuid = uuidV4();
	const salt = createSalt();
	const toEncrypt: PwdEncryptData = {
		uuid,
		username,
		clearPwd,
		salt,
	}

	const pwd = pwdEncrypt(toEncrypt);

	return {
		username,
		uuid,
		pwd,
		salt
	}
}
//#endregion ---------- /Utils ----------