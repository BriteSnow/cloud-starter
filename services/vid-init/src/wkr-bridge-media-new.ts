require('../../_common/src/setup-module-aliases');

import { assertEvent, getAppQueue, getJobQueue, VidInitJob } from 'common/queue.js';


main();

async function main() {

	// the read stream to bridge from
	const mediaNewQueue = getAppQueue('MediaNew');

	// the write stream to bridge to
	const vidInitQueue = getJobQueue('VidInitJob');

	const streamGroup = 'VidInitJobBridge';

	for (; ;) {
		const entry = await mediaNewQueue.next(streamGroup);
		assertEvent('MediaNew', entry.data);
		const { wksId, mediaId, mediaMimeType } = entry.data;

		if (mediaMimeType.startsWith('video')) {

			const vidInitTodo: VidInitJob = { type: 'VidInitJob', wksId, mediaId };
			await vidInitQueue.add(vidInitTodo);

		}


		// acknowledge this stream entry for this group (i.e., mark it as completed, remove from the redis stream group pending)
		await mediaNewQueue.ack(streamGroup, entry.id);
	}
}