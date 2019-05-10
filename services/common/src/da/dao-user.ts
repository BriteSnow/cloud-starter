import { BaseDao } from "./dao-base";
import { User } from "shared/entities";
import { Context } from "../context";
import { AccessRequires } from "./access";

export class UserDao extends BaseDao<User, number>{
	constructor() {
		super('user', true);
	}

	async getByUsername(ctx: Context, username: string) {
		return super.first(ctx, { username });
	}


	//#region    ---------- BaseDao Overrides ---------- 

	// For now, we allow anybody to call this for registration. 
	@AccessRequires(['#sys', '#admin'])
	async create(ctx: Context, data: Partial<User>) {
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
}