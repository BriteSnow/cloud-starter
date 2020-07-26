// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/services/web-server/src/web/dse-media.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { mediaDao } from 'common/da/daos';
import { AppError } from 'common/error';
import { ApiKtx, ApiRouter, routePost, success } from './koa-utils';



class MediaDse extends ApiRouter {

	@routePost('/dse/Media')
	async create(ktx: ApiKtx) {
		console.log('->> ...',);
		const utx = ktx.state.utx;
		// ctx.router available
		const file = ktx.request.files?.file; // 'file' is the formData name for the first file
		if (file) {
			// TODO: for now, just pass name
			const id = await mediaDao.createWithFile(utx, { file });
			const media = await mediaDao.get(utx, id);
			return success(media);
		} else {
			throw new AppError(`Cannot create media, file not found`);
		}
	}

}



export default function apiRouter(prefix?: string) { return new MediaDse(prefix) };