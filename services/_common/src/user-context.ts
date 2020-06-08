import { Immutable } from 'immer';
import { User } from 'shared/entities';
import { freeze } from 'shared/utils';
import { PerfContext } from './perf';
import { getProjectPrivileges } from './role-manager';


/**
 * Subset of the User object for UserContext object
 */
export type UserForContext = Immutable<Pick<User, 'id' | 'type'>>;

/** Note: Make context an interface so that ContextImpl class does not get expose and app code cannot create it of the newContext factory */
export interface UserContext {
	readonly userId: number;
	readonly userType: string;
	readonly user: UserForContext;
	hasProjectPrivilege(projectId: number, privilege: string): Promise<boolean>;
	readonly perfContext: PerfContext;
}


/** 
 * Create a new SysContext on every call. 
 * Note: user 0, if hardcode to be the sys user and can be in memory only for now. 
 */
export async function getSysContext(): Promise<UserContext> {
	return newUserContext({ id: 0, type: 'sys' }); // we know 0 is sys. 
}

export function isUserContext(obj: any): obj is UserContext {
	return (obj instanceof UserContextImpl);
}

export function assertUserContext(obj: any): asserts obj is UserContext {
	if (!(obj instanceof UserContextImpl)) {
		throw new Error(`Object is not of type UserContext ${obj?.constructor.name}`);
	}
}

export function newUserContext(user: Pick<User, 'id' | 'type'>) {
	// TODO: validate it has the right fields. 
	return new UserContextImpl(user);
}

//#region    ---------- Private Implementations ---------- 

class UserContextImpl implements UserContext {
	get userId() { return this._user.id };
	get userType() { return this._user.type };
	private privilegesByProjectId: Map<number, Set<string>> = new Map();
	private _user: UserForContext
	readonly perfContext = new PerfContext();

	_data = new Map<string, any>(); // not used yet. 

	get user() {
		return { ...this._user }; // shalow copy (should be enough)
	}

	constructor(user: UserForContext) {
		this._user = freeze(user);
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