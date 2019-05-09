import { BaseDao } from "./da/dao-base";
import { Job, JobState } from "./da/daos";
import { getSysContext } from "./context";
import { nowTimestamp } from "./utils";
import { queuePush, queuePop } from "./queue";
import { isNumber } from "util";


//#region    ---------- JobDao ---------- 
// for now, we have the jobDao as private
class JobDao extends BaseDao<Job, number>{
	constructor() {
		super('job', false);
	}
}
const jobDao = new JobDao()
//#endregion ---------- /JobDao ---------- 

export const jobManager = {
	start,
	state,
	result,
	job,
	next,
	complete,
	fail
}

/**
 * Create 
 * @param name Creat
 * @param data 
 */
async function start(name: string, data: any) {
	const queueName = name + '.todo';
	const ctx = await getSysContext();
	const newTime = nowTimestamp();
	const jobId = await jobDao.create(ctx, { name, newTime, state: 'new', data });

	// TODO: add to the queue
	await state(jobId, 'queued'); // do it before we queuePush, otherwise we might have a race condition with the worker.
	await queuePush(queueName, { jobId });

	return jobId;
}


type JobTimestampProperty = 'newTime' | 'queuedTime' | 'processingTime' | 'completedTime' | 'failedTime';
/**
 * Get or set the `job.state` (get when .state is undefined, set if defined)
 */
async function state(jobId: number, state?: JobState) {
	const ctx = await getSysContext();

	if (state === undefined) {
		const job = await jobDao.get(ctx, jobId);
		return job.state;
	} else {
		const timestampName = (state + 'Time') as JobTimestampProperty;
		const data: Partial<Job> = { state };
		data[timestampName] = nowTimestamp();
		await jobDao.update(ctx, jobId, data);
	}
}

async function result(jobId: number, result?: any) {
	const ctx = await getSysContext();

	if (result === undefined) {
		const job = await jobDao.get(ctx, jobId);
		return job.result;
	} else {
		const data: Partial<Job> = { result };
		await jobDao.update(ctx, jobId, data);
	}
}

/** Get a job for a jobId */
async function job(jobId: number) {
	const ctx = await getSysContext();

	return await jobDao.get(ctx, jobId);
}



/** Get the next job from a queue */
async function next(name: string) {
	const ctx = await getSysContext();

	const queueName = name + '.todo';
	const msg = await queuePop(queueName);

	if (!msg || !isNumber(msg.jobId)) {
		throw new Error(`Queue ${queueName} message does not contain .jobId (${msg})`);
	}

	const job = await jobDao.get(ctx, msg.jobId);
	return job;
}

async function complete(jobId: number, result: any) {
	const ctx = await getSysContext();

	await state(jobId, 'completed');
	await jobDao.update(ctx, jobId, { result });
}


async function fail(jobId: number, ex: any) {
	const ctx = await getSysContext();

	await state(jobId, 'failed');
	await jobDao.update(ctx, jobId, { error: JSON.stringify(ex) });
}

