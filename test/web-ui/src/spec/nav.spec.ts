

import { deepStrictEqual as equal } from 'assert';
import { HOME_URL, initSuite, textContent } from '../suite-utils.js';


describe('nav', function () {

	const suite = initSuite(this);

	it('nav-list', async function () {

		const page = suite.page;

		await page.goto(HOME_URL);
		await page.waitForSelector("v-nav");
		const navLabel = await textContent(page, 'v-nav a:first-child');
		equal(navLabel, 'Home');
	});


});