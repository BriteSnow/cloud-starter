import { promisify } from 'util';
import redis = require('redis');
import { RedisClient } from 'redis';

const maxRetry = 100;

/**
 * Simple redis wrapper that add promise and default retry_strategy
 */
export async function getNewRedisClient(host?: string): Promise<any> {
	host = (host) ? host : 'cstar-queue-srv';
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
		console.log(`Redis ready`, (<any>_redis_client).connection_options);
	})

	const methods = ['expire', 'get', 'set', 'quit', 'on', 'subscribe', 'psubscribe', 'lpush', 'rpush', 'brpop', 'rpop', 'lrange'];
	const client: any = { _redis_client };
	for (const m of methods) {
		client[m] = promisify((<any>_redis_client)[m]).bind(_redis_client);
	}

	return client;
}

class Client {
	private _redis_client: RedisClient;
	private _methods: any;

	constructor(redis_client: RedisClient) {
		this._redis_client = redis_client;
		const methods = ['expire', 'get', 'set', 'quit', 'on', 'subscribe', 'psubscribe', 'lpush', 'rpush', 'brpop', 'rpop', 'lrange'];
		this._methods = {};
		for (const m of methods) {
			this._methods[m] = promisify((<any>this._redis_client)[m]).bind(this._redis_client);;
		}
	}

	async get(key: string): Promise<string> {
		return this._methods.get(key);
	}

} 