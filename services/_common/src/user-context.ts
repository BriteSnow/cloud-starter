import { User } from 'shared/entities';
import { PerfContext } from './perf';
import { getProjectPrivileges } from './role-manager';


export type ContextUserType = Partial<User> & Pick<User, 'id' | 'username' | 'type'>;

/** Note: Make context an interface so that ContextImpl class does not get expose and app code cannot create it of the newContext factory */
export interface UserContext {
	readonly userId: number;
	readonly userType: string;
	readonly username: string | null;
	readonly user: ContextUserType;
	hasProjectPrivilege(projectId: number, privilege: string): Promise<boolean>;
	readonly perfContext: PerfContext;
}


let _sysContext: UserContext;
/** 
 * Get and cache the sysContext. 
 * Note: user 0, in the db, is of sys type, we can harcode the user data for now (perhpas later, do a knex.select to id:0 to get full data)
 */
export async function getSysContext(): Promise<UserContext> {
	if (!_sysContext) {
		_sysContext = newUserContext({ id: 0, username: 'sys', type: 'sys' }); // we know 0 is sys. 
	}
	return _sysContext;
}

export function assertUserContext(obj: any): asserts obj is UserContext {
	if (!(obj instanceof UserContextImpl)) {
		throw new Error(`Object is not of type UserContext ${obj?.constructor.name}`);
	}
}

export function newUserContext(user: Pick<User, 'id' | 'username' | 'type'>) {
	// TODO: validate it has the right fields. 
	return new UserContextImpl(user);
}

//#region    ---------- Private Implementations ---------- 

class UserContextImpl implements UserContext {
	readonly userId: number;
	readonly userType: string;
	private privilegesByProjectId: Map<number, Set<string>> = new Map();
	private _user: ContextUserType
	readonly perfContext = new PerfContext();

	_data = new Map<string, any>(); // not used yet. 

	get username() {
		return (this._user && this._user.username) ? this._user.username : null;
	}

	get user() {
		return { ...this._user }; // shalow copy (should be enough)
	}

	constructor(user: ContextUserType) {
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