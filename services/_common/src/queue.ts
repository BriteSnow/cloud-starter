import IORedis, { Redis } from "ioredis";


//#region    ---------- RedisClient Factory / Cache ---------- 
const REDIS_MAX_RETRY = 100;
const QUEUE_HOST = 'cstar-queue-srv';

interface Clients {
	common?: Redis
}

const clients: Clients = {};

/**
 * Redis client factory / cache for named redis client. 
 * 
 * IMPORTANT: Most of the application code should just use the shared 'common' redis client for NON BLOCKING read and write to the redis server. 
 *            However, for JobManagers, since they are read block, they MUST have their own redis client so that they do not block other code. 
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

	return client
}
//#endregion ---------- /RedisClient Factory / Cache ----------






