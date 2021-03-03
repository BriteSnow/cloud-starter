// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/services/common/src/da/db.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import KnexClient, { QueryBuilder } from 'knex';
import { types } from 'pg';
import { parse as pgArrayParse } from 'postgres-array';
import { Pool } from 'tarn';
import { isEmpty } from 'utils-min';
import { DB, KHOST } from '../conf';
import { UserContext } from '../user-context';
import { nowTimestamp } from '../utils';
export { QueryInterface } from 'knex';


//#region    ---------- PG Type Parsers ---------- 
// To get list - select oid, typname, typarray from pg_type;

// 20: int8 (bigint)
types.setTypeParser(20, function (val: string) {
	return parseInt(val); // TODO: need to make it bigInt
});

// 1016: _int8 (i.e., int8[])
// val is of format string like: '{123,1234}'
types.setTypeParser(1016, function (val: string) {
	return pgArrayParse(val, parseInt); // TODO: needs to make it big int
});
//#endregion ---------- /PG Type Parsers ---------- 

// KnexClient for the application (will be set by getKnexClient())
let _knex: KnexClient | undefined;



/**
 * Create a new Knex QueryBuilder and set the utx as query context.
 * 
 * Should be the main way to get knex queryBuiler (and only way when UserContext is available)
 * 
 * Usage: `const {query} = await knexQuery(utx, 'some_table')`
 */
export async function knexQuery(opts: QueryContextOptions): Promise<{ query: QueryBuilder }> {
	const knexClient = await getKnexClient();
	const query = knexClient(opts.tableName);
	const queryContext = new QueryContext(opts);
	query.queryContext(queryContext);

	// Note: Knex use Bluebird Promise and execute the sql query on first await/then, 
	//       hence the need to wrap the query into an object to prevent execution. 
	return { query };
}

interface QueryContextOptions {
	utx: UserContext,
	tableName: string,
	name?: string,
}

class QueryContext {
	#utx: UserContext;
	#tableName: string;
	#name?: string;
	#start: number; // start time

	get start() { return this.#start }
	get utx() { return this.#utx }
	get tableName() { return this.#tableName }
	get name() { return this.#name }

	constructor(opts: QueryContextOptions) {
		this.#tableName = opts.tableName;
		this.#utx = opts.utx;
		this.#name = opts.name;
		this.#start = Date.now();
	}
}

/**
 * Get the knex client (create if needed). 
 * 
 * Only one KnexClient for the whole application as it managed the pool. 
 * 
 * Note: Should be rarely use. Use `knexQuery(utx, tableName)` to get a new query builder. 
 */
export async function getKnexClient() {

	if (!_knex) {
		const dbOpts = DB;
		try {
			let longestQuery = 0;

			// create the new knex knex
			_knex = await KnexClient({
				client: 'pg',
				connection: dbOpts,
				pool: {
					min: 0,
					max: 5
				},
				acquireConnectionTimeout: 14000, // 14 secs. Knex default is 60sec
				postProcessResponse: function (result: any, qtx: any) {
					if (qtx instanceof QueryContext) {
						const duration = Date.now() - qtx.start;
						const size = result?.length;
						if (duration > longestQuery) {
							// TODO: Need to use new logger when available
							const name = (!isEmpty(qtx.name)) ? ` ${qtx.name}` : '';
							console.log(`PERF-INFO - ${nowTimestamp()} - db query - longest query ${duration}ms on ${qtx.tableName}${name} (items: ${size})`);
							// TODO: Need to add times / sql to usercontext

							longestQuery = duration;
						}
					}
					return result;
				}
			});

			//#region    ---------- Pool Monitoring ---------- 
			// Note: Knex use tarn as the pool manager. Here we 
			const pool = _knex?.client.pool as Pool<any>; // Hack to get access to used below

			// create connection times
			const createConStartMap = new Map<number, number>();
			let longestCreate = 0;
			pool.on('createRequest', evtId => { createConStartMap.set(evtId, Date.now()) });
			pool.on('createSuccess', evtId => {
				const now = Date.now();
				const duration = now - createConStartMap.get(evtId)!;
				createConStartMap.delete(evtId);
				if (duration > longestCreate) {
					// TODO: Need to use new logger when available
					console.log(`PERF-INFO - ${nowTimestamp()} - db pool - longest create ${duration}ms - from ${KHOST}`);
					longestCreate = duration;
				}
			});

			// acquire connection times
			const acquireConStartMap = new Map<number, number>();
			let longestAcquire = 0;
			pool.on('acquireRequest', evtId => { acquireConStartMap.set(evtId, Date.now()) });
			pool.on('acquireSuccess', evtId => {
				const now = Date.now();
				const duration = now - acquireConStartMap.get(evtId)!;
				acquireConStartMap.delete(evtId);
				if (duration > longestAcquire) {
					// TODO: Need to use new logger when available
					console.log(`PERF-INFO - ${nowTimestamp()} - db pool - longest acquire ${duration}ms - from ${KHOST}`);
					longestAcquire = duration;
				}
			});
			//#endregion ---------- /Pool Monitoring ---------- 

		} catch (ex) {
			console.log(`Cannot connect to `, dbOpts, ex);
			throw ex;
		}
	}

	return _knex;
}

export async function closeKnexClient() {
	const k = await getKnexClient();
	await k.destroy();
	_knex = undefined;
}