import * as assert from 'assert';
import { initSuite } from './t-utils';
import { jobManager } from 'common/job-manager';
import { getRedisClient } from 'common/queue';

/**
 * Test some basic crud operations with timestamps and all from admin (to access testing)
 *
 */

describe("test-job-manager", async function () {

	const suite = initSuite(this);


	it('job-manager-start', async function () {
		const jobName = 'test-job-01';

		// make sure the queue for this job name, otherwise, when error, can get out of sync and cause error after.
		await resetQueue(jobName);

		// create the database
		const jobId = await jobManager.start(jobName, { some: "data", num: 123 });
		suite.toClean('job', jobId);

		// test getting the job by jobId, should work
		let job = await jobManager.job(jobId);
		assert.strictEqual(jobName, job.name);
		assert.strictEqual('queued', job.state);
		assert.strictEqual(123, job.data.num);
		assert.strictEqual(typeof job.newTime, 'object', 'new time should be not null')
		assert.strictEqual(typeof job.queuedTime, 'object', 'queued time should be not null')
		assert.equal(job.processingTime, null, 'queued time should be not null')

		// test wait for job in queue and update state, should work
		job = await jobManager.next(jobName);
		assert.strictEqual(jobName, job.name);
		assert.strictEqual('queued', job.state);
		assert.strictEqual(123, job.data.num);
		await jobManager.state(job.id, 'processing');
		await jobManager.result(job.id, { totalProcessed: 123 });

		// test the updated state and result
		let state = await jobManager.state(job.id);
		assert.strictEqual('processing', state);
		job = await jobManager.job(jobId);
		assert.deepStrictEqual(job.result, { totalProcessed: 123 });
	});

});


async function resetQueue(name: string) {
	name += '.todo';
	const client = await getRedisClient();
	await client.del(name);

}