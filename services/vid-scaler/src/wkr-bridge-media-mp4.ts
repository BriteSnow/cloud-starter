require('../../_common/src/setup-module-aliases');

import { assertEvent, getAppQueue, getJobQueue, VidScalerJob } from 'common/queue.js';


main();

async function main() {

	// the read stream to bridge from
	const mediaMp4Queue = getAppQueue('MediaMainMp4');

	// the write stream to bridge to
	const vidScalerTodoQueue = getJobQueue('VidScalerJob');

	const streamGroup = 'vid-scaler-bgrp';

	for (; ;) {
		const entry = await mediaMp4Queue.next(streamGroup);
		assertEvent('MediaMainMp4', entry.data);

		const { wksId, mediaId } = entry.data;


		const vidScalerTodo: VidScalerJob = { type: 'VidScalerJob', wksId, mediaId, res: '480p30' };
		await vidScalerTodoQueue.add(vidScalerTodo);


		// acknowledge this stream entry for this group (i.e., mark it as completed, remove from the redis stream group pending)
		await mediaMp4Queue.ack(streamGroup, entry.id);
	}
}