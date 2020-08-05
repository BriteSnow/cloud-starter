import IORedis, { Redis } from "ioredis";
import redstream, { objectDataParser, objectDataSerializer, RedStream } from 'redstream';
import { StreamEntry, XReadGroupResult } from 'redstream/dist/redstream';
import { KHOST } from './conf';
import { EventDic } from './event/event-types';
import { typify } from './utils';

export * from './event/event-assert';
export * from './event/event-types';

//#region    ---------- Stream Queues ----------
export interface Queue<N extends keyof EventDic> {
	next(group: string): Promise<StreamEntry<EventDic[N]>>;
	add(data: EventDic[N]): Promise<string>;
	ack(group: string, entryId: string): Promise<number>;
}

/** 
 * Contains the application queue semantic apis on top of redis stream.
 */
class QueueImpl<N extends keyof EventDic> implements Queue<N>{
	#stream: RedStream<EventDic[N]>
	constructor(name: N) {
		this.#stream = getStream(name);
	}

	/** Add a new event to the stream */
	async add(data: EventDic[N]) {
		return this.#stream.xadd(data);
	}

	/** 
	 * Block xreadgroup the next one from a group (KHOST is the consumer) 
	 **/
	async next(group: string): Promise<StreamEntry<EventDic[N]>> {
		let res: XReadGroupResult<EventDic[N]> | null = null;

		for (; ;) {
			res = await this.#stream.xreadgroup(group, KHOST, { block: true, count: 1 });
			if (res?.entries[0]?.data != null) {
				// TODO freeze before return (prevent caller to do any change)
				return res.entries[0] as StreamEntry<EventDic[N]>;
			}
		}
	}

	/** XACK (remove from pending list) */
	async ack(group: string, entryId: string) {
		return this.#stream.xack(group, entryId);
	}
}

// export function getQueue<N extends keyof DataEventDic>(name: N, forBlocking?: boolean): Queue<N>
// export function getQueue<N extends keyof JobEventDic>(name: N, forBlocking?: boolean): Queue<N>
export function getQueue<N extends keyof EventDic>(name: N, forBlocking = true): Queue<N> {
	return new QueueImpl(name);
}



export function getStream<K extends keyof EventDic>(name: K, forBlocking = true): RedStream<EventDic[K]> {
	const r = redstream(getRedisClient(forBlocking || 'common'), {
		key: name,
		dataParser: function (arr) {
			const obj = objectDataParser(arr);
			const data = typify(obj, { nums: ['mediaId', 'wksId'] });
			return data as EventDic[K];
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






