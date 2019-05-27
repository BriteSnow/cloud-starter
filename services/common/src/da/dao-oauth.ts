// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/services/common/src/da/dao-oauth.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { BaseDao } from './dao-base';
import { OAuth } from 'shared/entities';
import { Context } from '../context';
import { AccessRequires } from './access';

export class OAuthDao extends BaseDao<OAuth, number>{
	constructor() {
		super('oauth', true);
	}

	async getForUserId(ctx: Context, userId: number) {
		return super.first(ctx, { userId });
	}

	//#region    ---------- BaseDao Overrides ---------- 

	// For now, we allow anybody to call this for registration. 
	@AccessRequires(['#sys', '#admin'])
	async create(ctx: Context, data: Partial<OAuth>) {
		return super.create(ctx, data);
	}

	@AccessRequires(['#sys', '#admin'])
	async update(ctx: Context, id: number, data: Partial<OAuth>) {
		return super.update(ctx, id, data);
	}
	//#endregion ---------- /BaseDao Overrides ---------- 
}