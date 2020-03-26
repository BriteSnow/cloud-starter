import puppeteer, { Browser, Page } from 'puppeteer';

declare global {
	namespace Mocha {
		interface Suite {
			page: Page
		}
	}
}

export const HOME_URL = 'http://localhost:8080/';

export function initSuite(suite: Mocha.Suite, loggedin = true) {

	suite.beforeAll(async function () {
		this.timeout(5000);
		const browser = await getBrowser();
		if (loggedin) {
			suite.page = await loggedinPage(browser);
		} else {
			suite.page = await browser.newPage();
		}
	});

	suite.afterAll(async function () {
		this.timeout(5000);
		// runs once after the last test in this block
		const browser = suite.page.browser();
		browser.close();
		_browser = undefined;
	});

	suite.beforeEach(async function () {
	});

	return suite;
}

//#region    ---------- Module Private Utils ---------- 

let _browser: Browser | undefined;
let _loggedinPage: Page | undefined;

async function getBrowser() {
	if (!_browser) {
		_browser = await puppeteer.launch();

	}
	return _browser;
}


async function loggedinPage(browser: Browser) {

	if (!_loggedinPage) {
		const page = await browser.newPage();
		await doLogin(page);
		_loggedinPage = page;
	}

	// FIXME: This will return the same page for everybody

	return _loggedinPage;

}
//#endregion ---------- /Module Private Utils ----------

//#region    ---------- Utils ---------- 

export async function doLogin(page: Page, username = 'admin', pwd = 'welcome') {
	// assume page is new page

	await page.goto(HOME_URL);
	await page.waitForSelector("m-input[name='username'] input");
	await page.waitForSelector("m-input[name='pwd'] input");
	await page.type("m-input[name='username'] input", username);
	await page.type("m-input[name='pwd'] input", pwd);
	await page.click("button.for-login");
	try {
		await page.waitForSelector("v-nav", { timeout: 300 });
	} catch (ex) {
		throw new Error('Login fail');
	}

};

export async function textContent(page: Page, selector: string): Promise<string | undefined> {
	const txt = await page.$eval("v-nav a:first-child", (el) => {
		return el.textContent?.trim();
	});
	return txt;
}

export async function innerHtml(page: Page, selector: string): Promise<string> {
	const html = await page.$eval(selector, (el) => {
		return el.innerHTML.trim();
	});
	return html;
}
//#endregion ---------- /Utils ----------