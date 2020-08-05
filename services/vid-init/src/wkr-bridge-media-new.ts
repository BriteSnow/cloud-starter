require('../../_common/src/setup-module-aliases');

import { assertEvent, getQueue, JobVidInitTodo } from 'common/queue';


main();

async function main() {
	console.log('->> bridge-media-new', getQueue);

	// the read stream to bridge from
	const mediaNewQueue = getQueue('MediaNew');

	// the write stream to bridge to
	const vidInitQueue = getQueue('JobVidInitTodo');

	const streamGroup = 'vid-init-bridge';

	for (; ;) {
		const entry = await mediaNewQueue.next(streamGroup);
		assertEvent('MediaNew', entry.data);
		const { wksId, mediaId, name } = entry.data;

		console.log('->> worker-bridge read from MediaNew ', entry);

		const vidInitTodo: JobVidInitTodo = { type: 'JobVidInitTodo', wksId, mediaId };
		await vidInitQueue.add(vidInitTodo);

		console.log('->> worker-bridge sent to JobVidInitTodo', vidInitTodo);

		// acknowledge this stream entry for this group (i.e., mark it as completed, remove from the redis stream group pending)
		await mediaNewQueue.ack(streamGroup, entry.id);
	}
}