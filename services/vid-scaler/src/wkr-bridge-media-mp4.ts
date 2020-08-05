require('../../_common/src/setup-module-aliases');

import { assertEvent, getQueue, JobVidScalerTodo } from 'common/queue';


main();

async function main() {
	console.log('->> bridge-media-new', getQueue);

	// the read stream to bridge from
	const mediaMp4Queue = getQueue('MediaMainMp4');

	// the write stream to bridge to
	const vidScalerTodoQueue = getQueue('JobVidScalerTodo');

	const streamGroup = 'vid-scaler-bgrp';

	for (; ;) {
		const entry = await mediaMp4Queue.next(streamGroup);
		assertEvent('MediaMainMp4', entry.data);

		const { wksId, mediaId } = entry.data;

		console.log('->> worker-bridge read from MediaMainMp4 ', entry);

		const vidScalerTodo: JobVidScalerTodo = { type: 'JobVidScalerTodo', wksId, mediaId, res: '480p30' };
		await vidScalerTodoQueue.add(vidScalerTodo);

		console.log('->> worker-bridge sent to JobVidScalerTodo', vidScalerTodo);

		// acknowledge this stream entry for this group (i.e., mark it as completed, remove from the redis stream group pending)
		await mediaMp4Queue.ack(streamGroup, entry.id);
	}
}