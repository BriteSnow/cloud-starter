// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-bigapp/master/services/web-server/src/web/router-dse-generics.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { WksQueryOptions } from 'common/da/dao-wks';
import { wksDao } from 'common/da/daos';
import { ApiKtx, ApiRouter, routeGet } from './koa-utils';



class WksDse extends ApiRouter {

	@routeGet('/dse/Wks')
	async list(ktx: ApiKtx) {
		const ctx = ktx.state.utx;

		const type = ktx.params.type;

		let queryOptions: WksQueryOptions = { access: 'wa_content_view' };

		// TODO need to validate
		if (typeof ktx.query.matching == 'string') {
			queryOptions.matching = JSON.parse(ktx.query.matching);
		}

		const entities = await wksDao.list(ctx, queryOptions);

		return { success: true, data: entities };
	}

}



export default function apiRouter(prefix?: string) { return new WksDse(prefix) };