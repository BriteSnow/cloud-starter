require('../../_common/src/setup-module-aliases');

import { CORE_STORE_ROOT_DIR, __version__ } from 'common/conf';
import { mediaDao } from 'common/da/daos';
import { getQueueStream } from 'common/queue';
import { getCoreBucket } from 'common/store';
import { getSysContext } from 'common/user-context';
import { mkdirs } from 'fs-extra';
import { spawn } from 'p-spawn';
import * as Path from 'path';
import { split } from 'utils-min';
import { v4 as newUuid } from 'uuid';
/////////////////////
// The agent service is primarely designed to run administative task, and therefore does not do anything 
// in the start process. However, as some point, it could listen to redis stream and/or pub/sub to do some
// administrative task ask well. 
////


start();

async function start() {
	console.log(`--> web-server (${__version__}) - starting`);

	// const bucketStream = getBucketEventStream(CORE_STORE_BUCKET.bucketName, true);
	const stream = getQueueStream('media_new');

	let id = '0';
	for (; ;) {
		const rec = await stream.xread(id, { block: true, count: 1 });
		if (rec) {
			const entry = rec.entries[0];
			const wksId = Number(entry.data.wksId);
			const mediaId = Number(entry.data.mediaId);

			const sysUtx = await getSysContext({ wksId });
			const media = await mediaDao.get(sysUtx, mediaId);

			const srcName = media.name;
			if (srcName.endsWith('.mov')) {
				const coreStore = await getCoreBucket();

				const tempDir = `temp/${newUuid()}/`;

				const mp4Name = Path.parse(srcName).name + '.mp4';
				const remoteSrcFile = CORE_STORE_ROOT_DIR + media.folderPath + media.srcName;
				const remoteMp4File = CORE_STORE_ROOT_DIR + media.folderPath + mp4Name;
				const tempSrcFile = Path.join(tempDir, srcName);
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

			id = rec.highest!;

		}

	}
}


