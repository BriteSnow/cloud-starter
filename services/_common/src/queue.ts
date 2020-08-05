import IORedis, { Redis } from "ioredis";
import redstream, { objectDataParser, objectDataSerializer, RedStream } from 'redstream';
import { StreamEntry, XReadGroupResult } from 'redstream/dist/redstream';
import { AllEventDic, AppEventDic, JobEventDic } from 'shared/event-types';
import { KHOST } from './conf';
import { typify } from './utils';

export * from 'shared/event-types';
export * from './event/event-assert';

export interface Queue<N extends keyof D, D = AllEventDic> {
	next(group: string, timeout: number): Promise<StreamEntry<D[N]> | null>;
	next(group: string): Promise<StreamEntry<D[N]>>;

	add(data: D[N]): Promise<string>;
	ack(group: string, entryId: string): Promise<number>;
}

export interface JobQueue<N extends keyof D, D = JobEventDic> extends Queue<N, D> {
	nextJob(timeout: number): Promise<StreamEntry<D[N]> | null>;
	nextJob(): Promise<StreamEntry<D[N]>>;

	done(entry: StreamEntry<D[N]>): Promise<void>;
	fail(entry: StreamEntry<D[N]>, error: Error): Promise<void>;
}

// export function getQueue<N extends keyof DataEventDic>(name: N, forBlocking?: boolean): Queue<N>
// export function getQueue<N extends keyof JobEventDic>(name: N, forBlocking?: boolean): Queue<N>
export function getAppQueue<N extends keyof AppEventDic>(name: N, forBlocking = true): Queue<N> {
	return new QueueImpl(name);
}

export function getJobQueue<N extends keyof JobEventDic>(name: N, forBlocking = true): JobQueue<N> {
	return new JobQueueImpl(name);
}


//#region    ---------- Stream Queues ----------
/** 
 * Contains the application queue semantic apis on top of redis stream.
 */
class QueueImpl<N extends keyof AllEventDic> implements Queue<N>{
	#stream: RedStream<AllEventDic[N]>
	constructor(name: N) {
		this.#stream = getStream(name);
	}

	/** Add a new event to the stream */
	async add(data: AllEventDic[N]) {
		return this.#stream.xadd(data);
	}

	/**
	 * 
	 * @param group 
	 * @param timeout 
	 */
	async next(group: string, timeout: number): Promise<StreamEntry<AllEventDic[N]> | null>
	async next(group: string): Promise<StreamEntry<AllEventDic[N]>>
	async next(group: string, timeout?: number): Promise<StreamEntry<AllEventDic[N]> | null> {
		let res: XReadGroupResult<AllEventDic[N]> | null = null;

		const block = timeout ?? true;

		for (; ;) {
			res = await this.#stream.xreadgroup(group, KHOST, { block, count: 1 });
			if (res?.entries[0]?.data != null) {
				// TODO freeze before return (prevent caller to do any change)
				return res.entries[0] as StreamEntry<AllEventDic[N]>;
			}
		}
	}

	/** XACK (remove from pending list) */
	async ack(group: string, entryId: string) {
		return this.#stream.xack(group, entryId);
	}
}

class JobQueueImpl<N extends keyof JobEventDic> extends QueueImpl<N>{
	#group: string;

	constructor(name: N) {
		super(name);
		this.#group = name + '-JGRP'
	}

	async nextJob(): Promise<StreamEntry<JobEventDic[N]>>
	async nextJob(timeout: number): Promise<StreamEntry<JobEventDic[N]> | null>
	async nextJob(timeout?: number): Promise<StreamEntry<JobEventDic[N]> | null> {
		return super.next(this.#group, timeout!); // TS-TRICK  otherwise, it say super.next cannot have undefined timeout
	}

	async done(entry: StreamEntry<JobEventDic[N]>) {
		await this.ack(this.#group, entry.id);
	}

	async fail(entry: StreamEntry<JobEventDic[N]>, error: Error) {
		// TODO: needs to log error in db
		await this.ack(this.#group, entry.id);
	}
}

export function getStream<K extends keyof AllEventDic>(name: K, forBlocking = true): RedStream<AllEventDic[K]> {
	const r = redstream(getRedisClient(forBlocking || 'common'), {
		key: name,
		dataParser: function (arr) {
			const obj = objectDataParser(arr);
			const data = typify(obj, { nums: ['mediaId', 'wksId'] });
			return data as AllEventDic[K];
		},
		// TODO: needs to assert the obj
		dataSerializer: function (obj: any) { return objectDataSerializer(obj) }
	});
	return r;
}

//#endregion ---------- /Stream Queues ----------

//#region    ---------- RedisClient Factory / Cache ---------- 
const REDIS_MAX_RETRY = 100;
const QUEUE_HOST = 'cstar-queue-srv';
let newSeq = 1; // the sequence id for anonymous redisClient (when getRedisClient(true))

interface Clients {
	common?: Redis
}

const clients: Clients = {};

/**
 * Redis client factory / cache for named redis client. 
 * 
 * If named, it has to match a clients names, and the client will be cached for this name.
 * If true, it means it will create a new one just for this request.
 * 
 * IMPORTANT: Most of the application code should just use the shared 'common' redis client for NON BLOCKING read and write to the redis server. 
 *            However, for JobManagers, since they are read block, they MUST have their own redis client so that they do not block other code. 
 *            This is why this function provides a simple way to get client by name, and the default is 'common'
 * 
 * NOTE: Also, we are fully typing which name we are allowing here, to make the code more tight, and prevent missed used of the API. If more 
 *       Names are needed, add the name in the Clients interface above. 
 */
export function getRedisClient(name_or_new: true | keyof Clients = 'common'): Redis {
	if (name_or_new === true) {
		return createRedisClient(`anonymous-${newSeq++}`);
	} else {
		const name = name_or_new;
		let client = clients[name];

		if (!client) {
			client = createRedisClient(name);
			clients[name] = client;
		}

		return client;
	}

}

function createRedisClient(name: string) {

	const client = new IORedis(QUEUE_HOST, {
		maxRetriesPerRequest: REDIS_MAX_RETRY,
		sentinelRetryStrategy: function (times: number) {
			console.log(`INFO - Redis client for ${name} sentinelRetryStrategy`, times);
			// reconnect after some time (wait longer with attempt up to 3 seconds)
			return Math.min(times * 10, 3000);
		}
	});

	client.on('ready', async function (data: any) {
		console.log(`INFO - Redis client for ${name} ready`);
	});

	return client;
}
//#endregion ---------- /RedisClient Factory / Cache ----------






