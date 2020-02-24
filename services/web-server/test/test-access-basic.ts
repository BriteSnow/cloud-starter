import * as assert from 'assert';
import { userDao } from 'common/da/daos';
import { newUserContext } from 'common/user-context';
import { User } from 'shared/entities';
import { initSuite } from './t-utils';

describe('test-access-basic', async function () {

	const suite = initSuite(this);


	it('access-basic-user-crud-from-admin', async function () {

		// test create user from admin, should work
		const testUser01Id = await userDao.create(suite.adminCtx, { username: 'test-access-basic-user-01' });

		// test update user from admin, should work
		await userDao.update(suite.adminCtx, testUser01Id, { username: 'test-access-basic-user-01 updated' });
		let testUser01: User | null = await userDao.get(suite.adminCtx, testUser01Id);
		assert.strictEqual(testUser01.username, 'test-access-basic-user-01 updated', 'username');

		// test remove from admin, should work
		await userDao.remove(suite.adminCtx, testUser01Id);
		testUser01 = await userDao.first(suite.adminCtx, { id: testUser01Id });
		assert.strictEqual(testUser01, null, 'testUser01 should be null');

	});


	it('access-basic-user-crud-from-userA', async function () {

		// test create user from test-user01 from userA, should fail
		await assert.rejects(userDao.create(suite.userACtx, { username: 'test-access-basic-user-01' }), suite.errorNoAccess, 'creating user form userA');

		// create test user 02 with admin
		const testUser01Id = await userDao.create(suite.adminCtx, { username: 'test-access-basic-user-01' });
		const testUser = await userDao.get(suite.sysCtx, testUser01Id);
		suite.toClean('user', testUser01Id);

		// test update testUser01 from userA, should fail
		await assert.rejects(userDao.update(suite.userACtx, testUser01Id, { username: 'test-access-basic-user-01 updated' }), suite.errorNoAccess, 'updating test-user-01 from userA');

		// test update testUser01 from testUser01, should work
		const testUser01Ctx = await newUserContext(testUser);
		await userDao.update(testUser01Ctx, testUser01Id, { username: 'test-access-basic-user-01 update 2' })

		// test get and check update from testUser01
		const testUser01 = await userDao.get(suite.adminCtx, testUser01Id);
		assert.strictEqual(testUser01.username, 'test-access-basic-user-01 update 2');


	});




});