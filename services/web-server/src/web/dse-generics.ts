// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/services/web-server/src/web/router-dse-generics.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { daoByEntity } from 'common/da/daos';
import { ApiKtx, ApiRouter, routeDelete, routeGet, routePatch, routePost } from './koa-utils';



class DseGenerics extends ApiRouter {

	@routeGet('/dse/:type')
	async list(ktx: ApiKtx) {
		const ctx = ktx.state.utx;

		const type = ktx.params.type;
		const dao = daoByEntity[type];

		let queryOptions: any = {};
		if (ktx.query.matching) {
			queryOptions.matching = JSON.parse(ktx.query.matching);
		}
		const entities = await dao.list(ctx, queryOptions);

		return { success: true, data: entities };
	}

	@routeGet('/dse/:type/:id')
	async get(ktx: ApiKtx) {
		const ctx = ktx.state.utx;

		const type = ktx.params.type;
		const dao = daoByEntity[type];

		const id = parseInt(ktx.params.id);

		const entity = await dao.get(ctx, id);

		return { success: true, data: entity };
	}

	@routePost('/dse/:type')
	async create(ktx: ApiKtx) {
		const ctx = ktx.state.utx;

		const type = ktx.params.type;
		const dao = daoByEntity[type];

		const data = ktx.request.body;
		const id = await dao.create(ctx, data);
		const entity = await dao.get(ctx, id);

		return { success: true, data: entity };
	}

	@routePatch('/dse/:type/:id')
	async update(ktx: ApiKtx) {
		const ctx = ktx.state.utx;
		const type = ktx.params.type;
		const id = parseInt(ktx.params.id);
		const dao = daoByEntity[type];

		const data = ktx.request.body;
		await dao.update(ctx, id, data);
		const entity = await dao.get(ctx, id);

		return { success: true, data: entity };
	}

	@routeDelete('/dse/:type/:id')
	async delete(ktx: ApiKtx) {
		const ctx = ktx.state.utx;
		const type = ktx.params.type;
		const id = parseInt(ktx.params.id);
		const dao = daoByEntity[type];

		await dao.remove(ctx, id);

		return { success: true };
	}


}



export default function apiRouter(prefix?: string) { return new DseGenerics(prefix) };