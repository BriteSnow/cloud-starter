// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/shared/src/entities-base.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

/**
 * 
 * A filter is a name: Val or OpVal map that set conditions that needs to be all met (AND)
 * All name:value in a Filter need to be met. For example
 *  - `{"projectId": 123}` will select entities with projectId == 123 (default operation is =)
 *  - `{"stage": {op: '>', 1}}` will select entity with stage > 1
 *  - `{"stage;>": 1, "projectId": 123}`: will select entities from projectId 123 AND stage > 1
 * 
 **/
export type Op = '=' | '!=' | '<' | '<=' | '>' | '>=' | 'like' | 'ilike' | string; // add string to make sure we do not limit to known ones.
export type Val = string | number | boolean | null | any; // for now need to add the 'any' as in the 'maching' case we do not control the E type
export type OpVal = { op: Op, val: Val };
export interface Filter {
	[name: string]: Val | OpVal;
}

/**
 * Filters is one or more Filter object. Each filter object is executed with a OR.
 */
export type Filters = Filter | Filter[];

export interface QueryOptions<E> {
	// matching is a filter constraints to the property name/type of the Entity
	matching?: {
		[C in keyof E]?: E[C] | { op: Op, val: E[C] };
	};
	ids?: number[];
	orderBy?: string;
	limit?: number;
	offset?: number;
	filters?: Filters;
}

export interface StampedEntity {
	cid?: number,
	ctime?: string,
	mid?: number,
	mtime?: string
}

export interface OAuth extends StampedEntity {
	id: number;
	userId: number;
	oauth_token: string;
	oauth_id?: string;
	oauth_username?: string;
	oauth_name?: string;
	oauth_picture?: string;
}