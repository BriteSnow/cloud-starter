require('../../_common/src/setup-module-aliases');

import { getConfig } from 'common/config';
import { getKnex } from 'common/da/db';

//main();

async function main() {

	// const client = await getNewRedisClient();

	// listenViaBlocking(client);
	neverEnd();

	const __version__ = await getConfig('__version__');

	console.log(`--> agent (${__version__}) - started`);

	const knex = await getKnex();
	const tableName = 'user';
	try {
		const obj = await knex(tableName).first().from(tableName);
	} catch (ex) {
		console.log(`Error - Cannot get connection`, ex);
	}
	console.log('user obj')
}

async function neverEnd() {
	await new Promise(function (resolve, reject) {
		console.log('Will never end...');
	});
}


async function listenViaBlocking(client: any) {
	let videoId: number | null = null;
	for (; true;) { // eslint-disable-line (we use for rather than while to be able to use "continue")
		try {
			// get the next item from the queue list
			const result = await client.brpop('agent.todo', 0);
			const str = result[1];
			if (str) {

			}
		} catch (ex) {
		}
	}
}

