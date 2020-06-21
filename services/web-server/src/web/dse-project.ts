// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/services/web-server/src/web/router-dse-generics.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { ProjectQueryOptions } from 'common/da/dao-project';
import { projectDao } from 'common/da/daos';
import { ApiKtx, ApiRouter, routeGet } from './koa-utils';



class ProjectDse extends ApiRouter {

	@routeGet('/dse/Project')
	async list(ktx: ApiKtx) {
		const ctx = ktx.state.utx;

		const type = ktx.params.type;

		let queryOptions: ProjectQueryOptions = { access: 'pa_view' };

		// TODO need to validate
		if (ktx.query.matching) {
			queryOptions.matching = JSON.parse(ktx.query.matching);
		}

		const entities = await projectDao.list(ctx, queryOptions);

		return { success: true, data: entities };
	}

}



export default function apiRouter(prefix?: string) { return new ProjectDse(prefix) };