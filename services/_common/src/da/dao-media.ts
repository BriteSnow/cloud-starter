import { File } from 'formidable'; // from koa-body
import * as Path from 'path';
import { Media, MediaResolution } from 'shared/entities';
import { CORE_STORE_CDN_BASE_URL, CORE_STORE_ROOT_DIR } from '../conf';
import { AppError } from '../error';
import { getQueue } from '../queue';
import { getCoreBucket } from '../store';
import { UserContext } from '../user-context';
import { getMediaType } from '../utils';
import { WksScopedDao } from './dao-wks-scoped';
import { wksDao } from './daos';


export class MediaDao extends WksScopedDao<Media, number> {

	constructor() { super({ table: 'media', stamped: true }) }


	//#region    ---------- Data Entity Processing Override ---------- 
	parseRecord(dbRec: any): Media {
		dbRec.url = `${CORE_STORE_CDN_BASE_URL}${CORE_STORE_ROOT_DIR}${dbRec.folderPath}${dbRec.name ?? dbRec.srcName}`;
		if (dbRec.sd) {
			dbRec.sdUrl = `${CORE_STORE_CDN_BASE_URL}${CORE_STORE_ROOT_DIR}${dbRec.folderPath}${getResMp4Name(dbRec.name, dbRec.sd)}`;
		}
		return dbRec as Media;
	}
	//#endregion ---------- /Data Entity Processing Override ---------- 

	/** Override the baseDao.create to require 'type' and 'name' */
	async create(utx: UserContext, data: Partial<Media> & Pick<Media, 'type' | 'name'>): Promise<number> {
		return super.create(utx, data);
	}

	//#region    ---------- Media Specific Methods ---------- 
	async createWithFile(utx: UserContext, data: Partial<Media> & { file: File }): Promise<number> {
		const wksId = utx.wksId;

		if (wksId == null) {
			throw new AppError(`media.uploadNewMedia cannot process, no utx.wksId`);
		}

		// TODO: For now, ignore any other data properties (infer all from name);
		const file = data.file;
		const coreStore = await getCoreBucket();

		const wks = await wksDao.get(utx, wksId);
		const srcName = file.name;
		const name = srcName; // at start same name
		const type = getMediaType(name);
		const mediaId = await this.create(utx, { srcName, name, type });
		const media = await this.get(utx, mediaId);
		const folderPath = `wks/${wks.uuid}/medias/${media.uuid}/`;
		await coreStore.upload(file.path, CORE_STORE_ROOT_DIR + folderPath + srcName);
		await this.update(utx, mediaId, { folderPath });

		getQueue('MediaNew').add({
			type: 'MediaNew',
			wksId,
			mediaId,
			name
		});

		return mediaId;
	}
	//#endregion ---------- /Media Specific Methods ---------- 
}

export function getResMp4Name(name: string, res: MediaResolution) {
	return Path.parse(name) + `-${res}.mp4`;
}