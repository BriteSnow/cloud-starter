/////////////////////
// The vid-init job service is reponsible to inialize the media video to make sure it has everything needed for further service. 
// - make sure it has a main .mp4 (if not .mp4, then, transcode and change name)
// - trigger the data event 
////

import { CORE_STORE_ROOT_DIR, __version__ } from '#common/conf.js';
import { mediaDao } from '#common/da/daos.js';
import { getAppQueue, getJobQueue } from '#common/queue.js';
import { getCoreBucket } from '#common/store.js';
import { getSysContext } from '#common/user-context.js';
import { execa } from 'execa';
import { mkdir } from 'fs/promises';
import { lookup } from 'mime-types';
import * as Path from 'path';
import { split } from 'utils-min';
import { v4 as newUuid } from 'uuid';
import { Worker } from 'worker_threads';


// for execa
const { stdout, stderr } = process;
const execaOpts = Object.freeze({ stdout, stderr });



start();

async function start() {
	console.log(`--> web-server (${__version__}) - starting`);

	new Worker('./dist/services/vid-init/src/wkr-bridge-media-new.js');

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
					await mkdir(tempDir, { recursive: true });
					await coreStore.download(remoteSrcFile, tempSrcFile);

					//ffmpeg -i input.mp4 -vcodec libx264 -crf 20 output.mp4
					await execa('ffmpeg', split(`-i ${tempSrcFile}  -vcodec libx264 -crf 20 ${tempMp4File}`, ' '));
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
