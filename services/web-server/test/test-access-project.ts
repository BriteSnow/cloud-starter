import * as assert from 'assert';
import { saveWksRole } from 'common/da/access-wks';
import { wksDao } from 'common/da/daos';
import { Wks } from 'shared/entities';
import { initSuite } from './t-utils';


describe("test-access-wks", async function () {

	const suite = initSuite(this);

	// test CRUD  wks from same user (i.e. owner)
	it('access-wks-self', async function () {

		// create wks from userA, should work
		let testWks01Id = await wksDao.create(suite.userACtx, { name: 'test-access-wks-01' });

		// test get, should work
		let testWks01: Wks | null = await wksDao.get(suite.userACtx, testWks01Id);
		assert.strictEqual(testWks01.name, 'test-access-wks-01');

		// test update from userA, should work
		await wksDao.update(suite.userACtx, testWks01Id, { name: 'test-access-wks-01-updated' });
		testWks01 = await wksDao.get(suite.userACtx, testWks01Id);
		assert.strictEqual(testWks01.name, 'test-access-wks-01-updated');

		// test remove wks from userA, should work
		await wksDao.remove(suite.userACtx, testWks01Id);
		testWks01 = await wksDao.first(suite.userACtx, { id: testWks01Id });
		assert.strictEqual(testWks01, null, 'wks01 should be null');

	});

	// test CRUD wks access from a user that do not have any access to the wks
	it('access-wks-stranger', async function () {

		// create wks from userA, should work
		let testWks01Id = await wksDao.create(suite.userACtx, { name: 'test-access-wks-01' });
		suite.toClean('wks', testWks01Id);

		// test read from userB, should work
		await assert.rejects(wksDao.get(suite.userBCtx, testWks01Id),
			suite.errorNoAccess, 'UserB shoul dnot have read access to userA wks');

		// test update from userB, should fail
		await assert.rejects(wksDao.update(suite.userBCtx, testWks01Id, { name: 'test-access-wks-01-updated' }),
			suite.errorNoAccess, 'UserB schould not have write access to userA wks');

		// test remove from userB, should fail
		await assert.rejects(wksDao.remove(suite.userBCtx, testWks01Id),
			suite.errorNoAccess, 'UserB schould not have remove access to userA wks');
	});

	// test CRUD wks access from a viewer user
	it('access-wks-viewer', async function () {

		// create wks from userA, should work
		let testWks01Id = await wksDao.create(suite.userACtx, { name: 'test-access-wks-01' });
		suite.toClean('wks', testWks01Id);

		// assign 'viewer' role to userB
		await saveWksRole(suite.userBCtx.userId, testWks01Id, 'wr_viewer');

		// test read from userB, should work
		const testWks01 = await wksDao.get(suite.userBCtx, testWks01Id);
		assert.strictEqual(testWks01.name, 'test-access-wks-01');

		// test update from userB, should fail
		await assert.rejects(wksDao.update(suite.userBCtx, testWks01Id, { name: 'test-access-wks-01-updated' }),
			suite.errorNoAccess, 'UserB schould not have write access to userA wks');

		// test remove from userB, should fail
		await assert.rejects(wksDao.remove(suite.userBCtx, testWks01Id),
			suite.errorNoAccess, 'UserB schould not have remove access to userA wks');
	});

	// test CRUD wks access from member user
	it('access-wks-member', async function () {

		// create wks from userA, should work
		let testWks01Id = await wksDao.create(suite.userACtx, { name: 'test-access-wks-01' });
		suite.toClean('wks', testWks01Id);

		// assign 'member' role to userB
		await saveWksRole(suite.userBCtx.userId, testWks01Id, 'wr_editor');

		// test read from userB, should work
		const testWks01 = await wksDao.get(suite.userBCtx, testWks01Id);
		assert.strictEqual(testWks01.name, 'test-access-wks-01');

		// test update from userB, should fail
		await assert.rejects(wksDao.update(suite.userBCtx, testWks01Id, { name: 'test-access-wks-01-updated' }),
			suite.errorNoAccess, 'UserB schould not have write access to userA wks');

		// test update from userB, should fail
		await assert.rejects(wksDao.remove(suite.userBCtx, testWks01Id),
			suite.errorNoAccess, 'UserB schould not have remove access to userA wks');

		// TODO need to test ticket and label when they are implemented
	});

	// test CRUD wks access from manager user
	it('access-wks-manager', async function () {

		// create wks from userA, should work
		let testWks01Id = await wksDao.create(suite.userACtx, { name: 'test-access-wks-01' });
		suite.toClean('wks', testWks01Id);

		// assign 'manager' role to userB
		saveWksRole(suite.userBCtx.userId, testWks01Id, 'wr_admin');

		// test read from userB, should work
		let testWks01 = await wksDao.get(suite.userBCtx, testWks01Id);
		assert.strictEqual(testWks01.name, 'test-access-wks-01');

		// test update from userB, should work
		await wksDao.update(suite.userBCtx, testWks01Id, { name: 'test-access-wks-01-updated' }),
			testWks01 = await wksDao.get(suite.userBCtx, testWks01Id);
		assert.strictEqual(testWks01.name, 'test-access-wks-01-updated');

		// test update from userB, should fail
		await assert.rejects(wksDao.remove(suite.userBCtx, testWks01Id),
			suite.errorNoAccess, 'UserB schould not have remove access to userA wks');

	});

});