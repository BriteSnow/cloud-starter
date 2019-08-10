// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/services/common/src/queue.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { promisify } from 'util';
import redis = require('redis');
import { RedisClient } from 'redis';


/** 
 * Wait for the next message from a queue (usually used in a for loop)
 * Assumptions: 
 *   - a queue is a redis list
 *   - can wait for a single queue
 *   - assume the message is one json element and can be parsed as such
*/
export async function queuePop(queueName: string) {

	const client = await getRedisClient();

	// here we assume 
	const result = await client.brpop(queueName, 0);

	// assume result is of one item, and first item is json formatted
	const msg = result[1];
	const data = JSON.parse(msg);
	return data;
}

export async function queuePush(queueName: string, message: any) {
	const client = await getRedisClient();
	const str = JSON.stringify(message);
	await client.lpush(queueName, str);
}


//#region    ---------- Redis Client Promise Wrapper ---------- 
const maxRetry = 100;
let _predisClient: any | undefined;
/**
 * Simple redis wrapper that add promise and default retry_strategy (can't return typed object since all signature change)
 */
export async function getRedisClient(host?: string): Promise<any> {
	host = (host) ? host : 'cstar-queue-srv';

	if (_predisClient) {
		return _predisClient;
	}

	// get the raw redis client ()
	const _redis_client: RedisClient = redis.createClient({
		host,
		retry_strategy: function (options) {

			let errorMsg = `Redis connection fail`;

			if (options.error && options.error.code === 'ECONNREFUSED') {
				errorMsg = ` ECONNREFUSED`;
				// End reconnecting on a specific error and flush all commands with
				// a individual error
				//return new Error('The server refused the connection');
			}
			if (options.total_retry_time > 1000 * 60 * 60) {
				// End reconnecting after a specific timeout and flush all commands
				// with a individual error
				return new Error('Retry time exhausted');
			}
			if (options.attempt > maxRetry) {
				// End reconnecting with built in error
				return new Error('Retry attempt exhausted');
			}

			errorMsg += ` will retry again (attempt: ${options.attempt} total_retry_time:${options.total_retry_time})`;

			console.log(errorMsg);

			// reconnect after some time (wait longer with attempt up to 3 seconds)
			return Math.min(options.attempt * 100, 3000);
		}
	});

	_redis_client.on('ready', function (data: any) {
		console.log(`Redis client ready`, (<any>_redis_client).connection_options);
	})
	const methods = ['expire', 'get', 'set', 'quit', 'on', 'subscribe', 'psubscribe', 'lpush', 'rpush', 'brpop', 'rpop', 'lrange', 'del'];
	const client: any = { _redis_client };
	for (const m of methods) {
		client[m] = promisify((<any>_redis_client)[m]).bind(_redis_client);
	}


	_predisClient = client;

	return _predisClient;
}
//#endregion ---------- /Redis Client Promise Wrapper ----------
