import { Immutable } from 'immer';
import { GlobalAccess, GlobalAccesses } from 'shared/access-types';
import { User } from 'shared/entities';
import { freeze } from 'shared/utils';
import { getWksAccesses } from './da/access-wks';
import { PerfContext } from './perf';


/**
 * Subset of the User object for UserContext object
 */
export interface UserForContext extends Immutable<Pick<User, 'id'>> {
	accesses: GlobalAccesses;
	wksId?: number; // the eventual wks scope of the context
}

/** Note: Make context an interface so that ContextImpl class does not get expose and app code cannot create it of the newContext factory */
export interface UserContext {
	readonly userId: number;
	readonly user: UserForContext;
	/** Check global access */
	hasAccess(access: GlobalAccess): boolean;
	/** Check wks access */
	hasWksAccess(wksId: number, access: string): Promise<boolean>;
	readonly perfContext: PerfContext;
	readonly wksId?: number;
}


/** 
 * Create a new SysContext on every call. 
 * Note: user 0, if hardcode to be the sys user and can be in memory only for now. 
 */
export async function getSysContext(): Promise<UserContext> {
	return newUserContext({ id: 0, accesses: { '#sys': true } }); // we know 0 is sys. 
}


export function isUserContext(obj: any): obj is UserContext {
	return (obj instanceof UserContextImpl);
}

export function assertUserContext(obj: any): asserts obj is UserContext {
	if (!(obj instanceof UserContextImpl)) {
		throw new Error(`Object is not of type UserContext ${obj?.constructor.name}`);
	}
}

export function newUserContext(user: UserForContext) {
	// TODO: validate it has the right fields. 
	return new UserContextImpl(user);
}

//#region    ---------- Private Implementations ---------- 

class UserContextImpl implements UserContext {

	#user: UserForContext;
	#data = new Map<string, any>(); // not used yet. 

	get userId() { return this.#user.id };
	get wksId() { return this.#user.wksId };

	private accessesByWksId: Map<number, Set<string>> = new Map();
	readonly perfContext = new PerfContext();


	constructor(user: UserForContext) {
		// double check that if '#sys' access, only id === 0;
		if (user.accesses['#sys'] && user.id !== 0) {
			throw new Error(`FATAL ERROR - #sys is only valid for user.id 0, but was requested for (${user.id})`);
		}
		this.#user = freeze(user);
	}

	get user() {
		return { ...this.#user }; // shalow copy (should be enough)
	}

	hasAccess(access: GlobalAccess) {
		return this.#user.accesses[access] ?? false;
	}

	async hasWksAccess(wksId: number, access: string) {

		// first, get the privileges for this user on this wks (from context cache)
		let privileges = this.accessesByWksId.get(wksId);
		// if not found, we load it and set it to the context cache
		if (privileges == null) {
			const privilegesArray = await getWksAccesses(this.userId, wksId);
			privileges = new Set(privilegesArray);
			this.accessesByWksId.set(wksId, privileges);
		}
		return privileges.has(access);
	}

	// set or get a data for a key
	// val: If null or object, will set the data with val, and return this (i.e. Context object)
	//      If 
	data(key: string, val: any | undefined | null) {
		if (val === undefined) {
			return this.#data.get(key);
		} else {
			this.#data.set(key, val);
			return this;
		}
	}

}
//#endregion ---------- /Private Implementations ----------