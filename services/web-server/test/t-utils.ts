import { userDao } from 'common/da/daos';
import { closeKnexClient, getKnexClient } from "common/da/db";
import { getSysContext, newUserContext, UserContext as CommonContext, UserContext } from 'common/user-context';
import { GlobalRoleName } from '../../../shared/src/access-types';


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

		const sysCtx = await getSysContext();
		suite.sysCtx = sysCtx;

		// for each suite, we will have a some reusable users 
		// Note: in some system, you might want to create couple of users per user type (visitorA, visitorB, userA, userB)
		suite.adminCtx = await test_newUserCtxForUserId(suite.sysCtx, 1);

		suite.userACtx = await test_createNewUser(sysCtx, { username: 'test-user-A', clearPwd: 'welcome', role: 'r_user' });
		suite.userBCtx = await test_createNewUser(sysCtx, { username: 'test-user-B', clearPwd: 'welcome', role: 'r_user' });

		// suite.userACtx = await userDao.newContextFromUserId(suite.sysCtx, await userDao.createUser(suite.adminCtx, { username: 'test-user-A', clearPwd: 'welcome' }));
		// suite.userBCtx = await userDao.newContextFromUserId(suite.sysCtx, await userDao.createUser(suite.adminCtx, { username: 'test-user-B', clearPwd: 'welcome' }));
	});

	suite.afterAll(async function () {
		// after the suite, we remove the userA,B
		await userDao.remove(suite.sysCtx, suite.userACtx.userId);
		await userDao.remove(suite.sysCtx, suite.userBCtx.userId);
		await closeKnexClient();
	});

	suite.beforeEach(async function () {
		// Before each test, we make sure we have refresh context, since context are used to cache privileges and other context data
		suite.sysCtx = await newUserContext(suite.sysCtx.user);
		suite.adminCtx = await newUserContext(suite.adminCtx.user);
		suite.userACtx = await newUserContext(suite.userACtx.user);
		suite.userBCtx = await newUserContext(suite.userBCtx.user);
	})

	suite.afterEach(async function () {
		await clean(toCleanList);
		toCleanList = [];
	});

	return suite;
}

export async function test_createNewUser(sysCtx: UserContext, userData: { username: string, clearPwd: string, role?: GlobalRoleName }): Promise<UserContext> {
	const userOld = await userDao.getUserByUserName(sysCtx, userData.username);
	if (userOld != null) {
		userDao.remove(sysCtx, userOld.id);
	}
	const userId = await userDao.createUser(sysCtx, userData);
	return await test_newUserCtxForUserId(sysCtx, userId);
}

async function test_newUserCtxForUserId(sysCtx: UserContext, userId: number): Promise<UserContext> {
	const { accesses } = await userDao.getUserCredForAuth(sysCtx, { id: userId });
	return newUserContext({ id: userId, accesses });
}

async function clean(toClean: [string, number][]) {
	const k = await getKnexClient();
	for (const item of toClean) {

		const [tableName, id] = item;
		try {
			await k(tableName).delete().where({ id });
		} catch (ex) {
			console.log(` ${tableName} ${id} probably already deleted, we skip this one`);
		}

	}
}