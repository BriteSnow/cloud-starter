// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/shared/src/entities-base.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

/**
 * 
 * A QueryFilter is a filter use to customize the query of particular Query. 
 * 
 * It has the format of `{[columnName: string]: {op: string, val: any}}` and each property are executed as a AND of each other.
 * The OpVal can be simplified with string, in this case, it will default to op = '='. 
 * 
 * Examples
 *  - `{"projectId": 123}` will select entities with projectId == 123 (default operation is =)
 *  - `{"stage": {op: '>', 1}}` will select entity with stage > 1
 *  - `{"stage;>": 1, "projectId": 123}`: will select entities from projectId 123 AND stage > 1
 * 
 **/
export interface QueryFilter {
	[name: string]: Val | OpVal;
}

export type OpVal = { op: Op, val: Val };
export type Op = '=' | '!=' | '<' | '<=' | '>' | '>=' | 'like' | 'ilike' | string; // add string to make sure we do not limit to known ones.
export type Val = string | number | boolean | null | any; // for now need to add the 'any' as in the 'maching' case we do not control the E type


/**
 * Filters is one or more Filter object. Each filter object is executed with a OR.
 */
export type QueryFilters = QueryFilter | QueryFilter[];

export interface QueryOptions<E> {
	// matching is a QueryFilter constrained to the property name / value-type of the Entity
	matching?: {
		[C in keyof E]?: E[C] | { op: Op, val: E[C] };
	};
	ids?: number[];
	orderBy?: string;
	limit?: number;
	offset?: number;
	filters?: QueryFilters;
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