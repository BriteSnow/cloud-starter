require('../../_common/src/setup-module-aliases');

import { newUserCredential } from 'common/da/dao-user';


main();

async function main() {
	const username = 'joe';
	const pwd = 'welcome';
	console.log('...')
	console.log('....main', newUserCredential(username, pwd));
}