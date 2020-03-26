

import { doLogin, initSuite } from '../suite-utils';

describe('login', function () {

	const suite = initSuite(this, false);

	it('login-admin', async function () {
		const page = await suite.page.browser().newPage();
		await doLogin(page, 'admin', 'welcome');
	});


});