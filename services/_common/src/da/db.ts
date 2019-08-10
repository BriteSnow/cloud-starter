// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/services/common/src/da/db.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import * as knexClient from 'knex';
import { types } from 'pg';
import { getConfig } from '../config';
export { QueryInterface } from 'knex';


// 20: int8
types.setTypeParser(20, function (val: string) {
	return parseInt(val); // TODO: need to make it bigInt
	//return val;
});

// 1016: _int8 (i.e., int8[])
// val is of format string like: '{123,1234}'
types.setTypeParser(1016, function (val: string) {
	return types.arrayParser(val, parseInt); // TODO: needs to make it big int
	//return pgArrayParse(val, parseInt);
});

let _knex: knexClient | undefined;

export async function getKnex() {

	if (!_knex) {
		const dbOpts = await getConfig('db');
		try {
			_knex = await knexClient({
				client: 'pg',
				connection: dbOpts,
				pool: {
					min: 0,
					max: 5
				},
				acquireConnectionTimeout: 1000
			});
		} catch (ex) {
			console.log(`Cannot connect to `, dbOpts, ex);
			throw ex;
		}
	}

	return _knex;

}

export async function closeKnex() {
	const k = await getKnex();
	await k.destroy();
	_knex = undefined;

}