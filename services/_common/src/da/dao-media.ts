import { File } from 'formidable'; // from koa-body
import { Media } from 'shared/entities';
import { CORE_STORE_CDN_BASE_URL, CORE_STORE_ROOT_DIR } from '../conf';
import { AppError } from '../error';
import { getQueueStream } from '../queue';
import { getCoreBucket } from '../store';
import { UserContext } from '../user-context';
import { WksScopedDao } from './dao-wks-scoped';
import { wksDao } from './daos';


export class MediaDao extends WksScopedDao<Media, number> {

	constructor() { super({ table: 'media', stamped: true }) }

	//#region    ---------- Data Entity Processing Override ---------- 
	parseRecord(dbRec: any): Media {
		dbRec.url = `${CORE_STORE_CDN_BASE_URL}${CORE_STORE_ROOT_DIR}${dbRec.folderPath}${dbRec.name ?? dbRec.srcName}`;
		return dbRec as Media;
	}
	//#endregion ---------- /Data Entity Processing Override ---------- 

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
		const mediaId = await this.create(utx, { name });
		const media = await this.get(utx, mediaId);
		const folderPath = `wks/${wks.uuid}/medias/${media.uuid}/`;
		await coreStore.upload(file.path, CORE_STORE_ROOT_DIR + folderPath + srcName);
		await this.update(utx, mediaId, { folderPath, srcName, name });

		getQueueStream('media_new').xadd({
			type: 'media_new',
			wksId,
			mediaId
		});

		return mediaId;
	}
	//#endregion ---------- /Media Specific Methods ---------- 
}