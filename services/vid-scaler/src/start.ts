import { CORE_STORE_ROOT_DIR, __version__ } from '#common/conf.js';
import { getResMp4Name } from '#common/da/dao-media.js';
import { mediaDao } from '#common/da/daos.js';
import { getAppQueue, getJobQueue } from '#common/queue.js';
import { getCoreBucket } from '#common/store.js';
import { getSysContext } from '#common/user-context.js';
import { spawn } from 'p-spawn';
import * as Path from 'path';
import { split } from 'utils-min';
import { v4 as newUuid } from 'uuid';
import { Worker } from 'worker_threads';
const { mkdirs } = (await import('fs-extra')).default;

/////////////////////
// The agent service is primarely designed to run administative task, and therefore does not do anything 
// in the start process. However, as some point, it could listen to redis stream and/or pub/sub to do some
// administrative task ask well. 
////

start();

async function start() {
	console.log(`--> web-server (${__version__}) - starting`);

	new Worker('./dist/services/vid-scaler/src/wkr-bridge-media-mp4.js');

	const mediaScaledMp4Queue = getAppQueue('MediaScaledMp4');

	const vidScalerJobQueue = getJobQueue('VidScalerJob');

	for (; ;) {
		const entry = await vidScalerJobQueue.nextJob();
		let ffmpegResult: any = null;


		try {
			const { wksId, mediaId, res } = entry.data;

			const sysUtx = await getSysContext({ wksId });
			const media = await mediaDao.get(sysUtx, mediaId);

			const mediaName = media.name;

			const remoteOrginalFile = CORE_STORE_ROOT_DIR + media.folderPath + mediaName;

			// will return something like 'file-480p30.mp4' if name is 'file'
			const scaledName = getResMp4Name(mediaName, res);
			const remoteScaledFile = CORE_STORE_ROOT_DIR + media.folderPath + scaledName;

			const coreStore = await getCoreBucket();

			// if not already done, then, we update it. 
			if (!(await coreStore.exists(remoteScaledFile))) {
				const tempDir = `temp/${newUuid()}/`;
				await mkdirs(tempDir);

				const localOriginalFile = Path.join(tempDir, mediaName);
				const localScaledFile = Path.join(tempDir, scaledName);

				await coreStore.download(remoteOrginalFile, localOriginalFile);

				// FIXME: extract height and fps from scaledOptions string 
				const h = 480;
				const fps = 30;

				// ffmpeg -i vid-02.mp4 -vcodec libx264 -crf 23 -vf fps=30,scale=-2:480 -y vid-02-480p30.mp4
				// Note: crf 0-51, 23 being default. 17-18 close to lossless
				// Note: scale -2, to avoid getting (width cannot divide by 2), see https://stackoverflow.com/a/29582287/686724
				ffmpegResult = await spawn('ffmpeg', split(`-i ${localOriginalFile}  -vcodec libx264 -crf 23 -vf fps=${fps},scale=-2:${h} -y ${localScaledFile}`, ' '), { capture: ['stdout', 'stderr'], toConsole: false });

				await coreStore.upload(localScaledFile, remoteScaledFile);

				// send the data event
				await mediaScaledMp4Queue.add({ type: 'MediaScaledMp4', mediaId, wksId, res });
			}

			// update the sd if not present
			// TODO: later probably check if this new processed is the lowest resolution
			if (media.sd != res) {
				await mediaDao.update(sysUtx, mediaId, { sd: res });
			}

			await vidScalerJobQueue.done(entry);

		} catch (ex) {
			const msg = `ERROR - vid-scaler  ${ex} (ffmepg error: ${ffmpegResult?.stderr}) (skip and go next) - cause: ${ex}`;
			await vidScalerJobQueue.fail(entry, new Error(msg));
			console.log(msg, ex);
		}

	}


}