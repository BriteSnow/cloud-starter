

import { deepStrictEqual as equal } from 'assert';
import { HOME_URL, initSuite } from '../suite-utils';

describe('nav', function () {

	const suite = initSuite(this, true);

	it('nav-list', async function () {
		const page = suite.page;

		await page.goto(HOME_URL);
		const vnavMenu = await page.waitForSelector("v-nav");
		// console.log('>>> nav-list', vnavMenu);
		const navLabel = await page.$eval("v-nav a:first-child", (el) => {
			return el.textContent?.trim();
		});
		equal(navLabel, 'Home');
	});


});