// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/services/common/src/da/dao-user.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { QueryBuilder } from "knex";
import { QueryOptions, User } from "shared/entities";
import { Context } from "../context";
import { AppError } from "../error";
import { AccessRequires } from "./access";
import { BaseDao, CustomQuery } from "./dao-base";
import { getKnex } from "./db";

interface UseCredential {
	id: number;
	username: string;
	pwd: string;
	key: string;
}

export class UserDao extends BaseDao<User, number, QueryOptions<User>>{
	constructor() {
		super({ table: 'user', stamped: true });
	}

	/** 
	 * Return a user credential (.id, .username, .pwd, .key). 
	 * @param ref - if number, it's the user id, if string, the username
	 * This is the ONLY methods that should return the 'user.pwd' and 'user.key'
	 **/
	@AccessRequires(['#sys']) // here only sys context should be able to call this one
	async getUserCredential(ctx: Context, ref: number | string): Promise<UseCredential> {
		const k = await getKnex();
		let q = k(this.tableName);
		q.limit(1);
		q.columns(['id', 'username', 'pwd', 'key'])
		const colName = (typeof ref === 'string') ? 'username' : 'id';
		const result = await q.where(colName, ref);
		if (!result || result.length < 1) {
			throw new AppError(`Cannot find userWithCredential for ${ref}`);
		}
		return result[0] as UseCredential;
	}

	async getUserByUserName(ctx: Context, username: string): Promise<User | null> {
		return this.first(ctx, { username });
	}

	//#region    ---------- BaseDao Overrides ---------- 
	// For now, we allow anybody to call this for registration. 
	@AccessRequires(['#sys', '#admin'])
	async create(ctx: Context, data: Partial<User> & Partial<UseCredential>) {
		if (!data.type) { // make the default type user
			data.type = 'user';
		}
		return super.create(ctx, data);
	}

	@AccessRequires(['#sys', '#admin'])
	async remove(ctx: Context, id: number) {
		return super.remove(ctx, id);
	}

	@AccessRequires(['#sys', '#admin', '@id'])
	async update(ctx: Context, id: number, data: Partial<User>) {
		return super.update(ctx, id, data);
	}
	//#endregion ---------- /BaseDao Overrides ---------- 

	//#region    ---------- Query Override ---------- 
	/**
	 * Double precaution to make sure '.pwd' and '.key' are removed.
	 * Note: Here we log a code error so that we can fix the code approrietaly.
	 * @param user 
	 */
	processEntity(user: User) {
		if ((<any>user).pwd !== undefined) {
			delete (<any>user).pwd;
			console.log(`CODE ERROR - RECOVERED - UserDao processEntity had to remove '.pwd' for safety. Call completeQueryBuildWithQueryOptions.`)
		}
		if ((<any>user).pwd !== undefined) {
			delete (<any>user).key;
			console.log(`CODE ERROR - RECOVERED - UserDao processEntity had to remove '.key' for safety. Call completeQueryBuildWithQueryOptions.`)
		}
		return user;
	}

	/**
	 * This override make the user's columns explicit for all bse
	 */
	protected completeQueryBuildWithQueryOptions(ctx: Context, q: QueryBuilder<any, any>, queryOptions?: QueryOptions<User> & CustomQuery) {
		q.columns(['id', 'username', 'type', 'cid', 'ctime', 'mid', 'mtime']);
		return super.completeQueryBuildWithQueryOptions(ctx, q, queryOptions);
	}

	//#endregion ---------- /Query Override ---------- 
}