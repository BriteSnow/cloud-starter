require('../../_common/src/setup-module-aliases');

import { CORE_STORE_ROOT_DIR, __version__ } from 'common/conf';
import { mediaDao } from 'common/da/daos';
import { getAppQueue, getJobQueue } from 'common/queue';
import { getCoreBucket } from 'common/store';
import { getSysContext } from 'common/user-context';
import { mkdirs } from 'fs-extra';
import { lookup } from 'mime-types';
import { spawn } from 'p-spawn';
import * as Path from 'path';
import { split } from 'utils-min';
import { v4 as newUuid } from 'uuid';
import { Worker } from 'worker_threads';

/////////////////////
// The vid-init job service is reponsible to inialize the media video to make sure it has everything needed for further service. 
// - make sure it has a main .mp4 (if not .mp4, then, transcode and change name)
// - trigger the data event 
////

start();

async function start() {
	console.log(`--> web-server (${__version__}) - starting`);

	new Worker(__dirname + '/wkr-bridge-media-new.js');

	const mediaMainMp4Queue = getAppQueue('MediaMainMp4');

	const vidInitJobQueue = getJobQueue('VidInitJob');

	for (; ;) {
		const entry = await vidInitJobQueue.nextJob();

		const { wksId, mediaId } = entry.data;

		try {
			const sysUtx = await getSysContext({ wksId });
			const media = await mediaDao.get(sysUtx, mediaId);

			// if the media.name is not mp4, then, transcode
			// FIXME: needs to suport other video types
			const mediaName = media.name;
			const mediaType = lookup(mediaName) || 'unknown';
			if (mediaType != 'video/mp4') {
				const coreStore = await getCoreBucket();

				const tempDir = `temp/${newUuid()}/`;
				const mp4Name = Path.parse(mediaName).name + '.mp4';
				const remoteSrcFile = CORE_STORE_ROOT_DIR + media.folderPath + media.srcName;
				const remoteMp4File = CORE_STORE_ROOT_DIR + media.folderPath + mp4Name;
				const tempSrcFile = Path.join(tempDir, mediaName);
				const tempMp4File = Path.join(tempDir, mp4Name);

				if (!(await coreStore.exists(remoteMp4File))) {
					await mkdirs(tempDir);
					await coreStore.download(remoteSrcFile, tempSrcFile);

					//ffmpeg -i input.mp4 -vcodec libx264 -crf 20 output.mp4
					await spawn('ffmpeg', split(`-i ${tempSrcFile}  -vcodec libx264 -crf 20 ${tempMp4File}`, ' '), { toConsole: false });
					await coreStore.upload(tempMp4File, remoteMp4File);
				}
				await mediaDao.update(sysUtx, mediaId, { name: mp4Name });
			}

			//// Send the Data Event MediaMainMp4
			// NOTE: Even if the data was already mp4, then, we still send the event MediaMainMp4 for other to pickup
			const mediaAfterUpdate = await mediaDao.get(sysUtx, mediaId);
			if (mediaAfterUpdate.name.endsWith('.mp4')) {
				await mediaMainMp4Queue.add({ type: 'MediaMainMp4', wksId, mediaId });
			}

			await vidInitJobQueue.done(entry);

		} catch (ex) {
			const msg = `ERROR - vid-init - Cannot process media ${mediaId} - cause: ${ex} `;
			await vidInitJobQueue.fail(entry, new Error(msg));
			console.log(msg)
		}


	}
}


