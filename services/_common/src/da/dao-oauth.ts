// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-bigapp/master/services/common/src/da/dao-oauth.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { OAuth } from 'shared/entities';
import { UserContext } from '../user-context';
import { AccessRequires } from './access';
import { BaseDao } from './dao-base';

export class OAuthDao extends BaseDao<OAuth, number>{
	constructor() {
		super({ table: 'oauth', stamped: true });
	}

	async getForUserId(utx: UserContext, userId: number) {
		return super.first(utx, { userId });
	}

	//#region    ---------- BaseDao Overrides ---------- 

	// For now, we allow anybody to call this for registration. 
	@AccessRequires()
	async create(utx: UserContext, data: Partial<OAuth>) {
		return super.create(utx, data);
	}

	@AccessRequires()
	async update(utx: UserContext, id: number, data: Partial<OAuth>) {
		return super.update(utx, id, data);
	}
	//#endregion ---------- /BaseDao Overrides ---------- 
}