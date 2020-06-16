// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/services/common/src/queue.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import IORedis, { Redis } from "ioredis";



//#region    ---------- RedisClient Factory / Cache ---------- 
const host = 'cstar-queue-srv';
const maxRetry = 100;

interface Clients {
	common?: Redis, // for any non blocking redis call
	// 'job_queue_name'?: Redis // per stream blocking name 
}

const clients: Clients = {};

/**
 * Redis client factory / cache for named redis client. 
 * 
 * IMPORTANT: Most of the application code should just use the shared 'common' redis client for NON BLOCKING read and write to the redis server. 
 *            However, for JobManagers, since they are read block on stream, they MUST have their own redis client so that they do not block other code. 
 *            This is why this function provides a simple way to get client by name, and the default is 'common'
 * 
 * NOTE: Also, we are fully typing which name we are allowing here, to make the code more tight, and prevent missed used of the API. If more 
 *       Names are needed, add the name in the Clients interface above. 
 */
export function getRedisClient(name: keyof Clients = 'common'): Redis {
	let client = clients[name];

	if (!client) {
		client = createRedisClient(name);
		clients[name] = client;
	}

	return client;
}

function createRedisClient(name: string) {

	const client = new IORedis(host, {
		maxRetriesPerRequest: maxRetry,
		sentinelRetryStrategy: function (times: number) {
			console.log(`INFO - Redis client for ${name} sentinelRetryStrategy`, times);
			// reconnect after some time (wait longer with attempt up to 3 seconds)
			return Math.min(times * 10, 3000);
		}
	});

	client.on('ready', async function (data: any) {
		console.log(`INFO - Redis client for ${name} ready`);
	});

	return client
}
//#endregion ---------- /RedisClient Factory / Cache ----------
