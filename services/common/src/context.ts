import { PerfContext } from './perf';
import { User } from 'shared/entities';
import { oauthDao, userDao } from './da/daos';
import { getProjectPrivileges } from './role-manager';

// temporary hardcoded (should go to DB with roles)


/** Context factory. Right now just based on userId */
export async function newContext(userIdOrUser: number | Partial<User>) {
	let user: Partial<User>;
	// if we have a object, then, we can assume User
	if (typeof userIdOrUser === 'object') {
		user = userIdOrUser;
	} else {
		user = await userDao.get(await getSysContext(), userIdOrUser);
	}
	return new ContextImpl(user);
}


let _sysContext: Context;
/** 
 * Get and cache the sysContext. 
 * Note: user 0, in the db, is of sys type, we can harcode the user data for now (perhpas later, do a knex.select to id:0 to get full data)
 */
export async function getSysContext() {
	if (!_sysContext) {
		_sysContext = await newContext({ id: 0, username: 'sys', type: 'sys' }); // we know 0 is sys. 
	}
	return _sysContext;
}

/** Note: Make context an interface so that ContextImpl class does not get expose and app code cannot create it of the newContext factory */
export interface Context {
	readonly userId: number;
	readonly userType: string;
	readonly username: string | null;
	readonly user: Partial<User>;
	hasProjectPrivilege(projectId: number, privilege: string): Promise<boolean>;
	readonly perfContext: PerfContext;
}

//#region    ---------- Private Implementations ---------- 

class ContextImpl implements Context {
	readonly userId: number;
	readonly userType: string;
	private privilegesByProjectId: Map<number, Set<string>> = new Map();
	private _user: Partial<User>
	readonly perfContext = new PerfContext();

	_data = new Map<string, any>(); // not used yet. 

	get username() {
		return (this._user && this._user.username) ? this._user.username : null;
	}

	get user() {
		return { ...this._user }; // shalow copy (should be enough)
	}

	constructor(user: Partial<User>) {
		this.userId = user.id!;
		this.userType = user.type!; // TODO: needs to find a way to type this so that type is non optional
		this._user = user;
	}


	public async hasProjectPrivilege(projectId: number, privilege: string) {

		// first, get the privileges for this user on this project (from context cache)
		let privileges = this.privilegesByProjectId.get(projectId);
		// if not found, we load it and set it to the context cache
		if (privileges == null) {
			const privilegesArray = await getProjectPrivileges(this.userId, projectId)
			privileges = new Set(privilegesArray);
			this.privilegesByProjectId.set(projectId, privileges);
		}
		return privileges.has(privilege);
	}

	// set or get a data for a key
	// val: If null or object, will set the data with val, and return this (i.e. Context object)
	//      If 
	data(key: string, val: any | undefined | null) {
		if (val === undefined) {
			return this._data.get(key);
		} else {
			this._data.set(key, val);
			return this;
		}
	}

}
//#endregion ---------- /Private Implementations ----------