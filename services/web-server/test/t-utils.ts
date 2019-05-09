import { getKnex, closeKnex } from "common/da/db";
import { newContext, Context as CommonContext, getSysContext } from 'common/context';
import { userDao } from 'common/da/daos';


// Note: need to rename Context CommonContext because Mocha has it own Context

// extend the Mocha.Suite type with some application common test data and function
declare global {
	namespace Mocha {
		interface Suite {
			toClean: (tableName: string, id: any) => this;

			sysCtx: CommonContext;
			adminCtx: CommonContext;
			userACtx: CommonContext;
			userBCtx: CommonContext;

			errorNoAccess: RegExp
		}
	}
}

// Note: this needs to be sync and not be awaited, otherwise, should be after the it(...)

// Initialize a test suite for application common test data and behavior
export function initSuite(suite: Mocha.Suite) {

	let toCleanList: [string, number][] = [];

	suite.errorNoAccess = /does not have the necessary access/;

	suite.toClean = function (tableName: string, id: number) {
		toCleanList.push([tableName, id]);
		return suite;
	}

	// on the beforeAll, we create all of the context
	suite.beforeAll(async function () {
		suite.sysCtx = await getSysContext();
		suite.adminCtx = await newContext(1); // admin user

		// for each suite, we will have a some reusable users 
		// Note: in some system, you might want to create couple of users per user type (visitorA, visitorB, userA, userB)
		suite.userACtx = await newContext(await userDao.create(suite.adminCtx, { username: 'test-user-A', type: 'user' }));
		suite.userBCtx = await newContext(await userDao.create(suite.adminCtx, { username: 'test-user-B', type: 'user' }));
	});

	suite.afterAll(async function () {
		// after the suite, we remove the userA,B
		await userDao.remove(suite.adminCtx, suite.userACtx.userId);
		await userDao.remove(suite.adminCtx, suite.userBCtx.userId);
		await closeKnex();
	});

	suite.beforeEach(async function () {
		// Before each test, we make sure we have refresh context, since context are used to cache privileges and other context data
		suite.sysCtx = await newContext(suite.sysCtx.user);
		suite.adminCtx = await newContext(suite.adminCtx.user);
		suite.userACtx = await newContext(suite.userACtx.user);
		suite.userBCtx = await newContext(suite.userBCtx.user);
	})

	suite.afterEach(async function () {
		await clean(toCleanList);
		toCleanList = [];
	});

	return suite;
}



async function clean(toClean: [string, number][]) {
	const k = await getKnex();
	for (const item of toClean) {

		const [tableName, id] = item;
		try {
			await k(tableName).delete().where({ id });
		} catch (ex) {
			console.log(` ${tableName} ${id} probably already deleted, we skip this one`);
		}

	}
}