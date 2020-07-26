import { strictEqual } from 'assert';
import { wksDao } from 'common/da/daos';
import { Wks } from 'shared/entities';
import { wait } from 'utils-min';
import { initSuite } from './t-utils';
import assert = require('assert');

/**
 * Test some basic crud operations with timestamps and all from admin (to access testing)
 *
 */

describe("test-dao-basic", async function () {

	const suite = initSuite(this);

	it('dao-basic-remove', async function () {
		const ctx = suite.adminCtx;

		//// cleanup existing test wks
		let testWkss = await wksDao.list(ctx, { access: 'wa_content_view', matching: { name: { op: 'ilike', val: 'test%' } } });
		if (testWkss.length > 0) {
			await wksDao.remove(ctx, testWkss.map(p => p.id));
		}
		testWkss = await wksDao.list(ctx, { access: 'wa_content_view', matching: { name: { op: 'ilike', val: 'test%' } } });
		strictEqual(testWkss.length, 0);

		//// create test data
		await wksDao.create(ctx, { name: 'test - 001' });
		await wksDao.create(ctx, { name: 'test - 002' });
		await wksDao.create(ctx, { name: 'test - 003' });

		//// check the test data
		testWkss = await wksDao.list(ctx, { access: 'wa_content_view', matching: { name: { op: 'ilike', val: 'test%' } } });
		strictEqual(testWkss.length, 3);

		//// delete one
		const p1 = testWkss.shift()!;
		let deleted = await wksDao.remove(ctx, p1.id);
		strictEqual(deleted, 1);
		testWkss = await wksDao.list(ctx, { access: 'wa_content_view', matching: { name: { op: 'ilike', val: 'test%' } } });
		strictEqual(testWkss.length, 2);

		//// test delete the multiple 
		deleted = await wksDao.remove(ctx, testWkss.map(p => p.id));
		strictEqual(deleted, 2);
		testWkss = await wksDao.list(ctx, { access: 'wa_content_view', matching: { name: { op: 'ilike', val: 'test%' } } });
		strictEqual(testWkss.length, 0);
	});

	it('dao-basic-crud-wks', async function () {
		try {
			let wks: Wks | undefined;

			// test create
			const wksId = await wksDao.create(suite.adminCtx, { name: 'test-dao-basic-crud-wks_wks-01' });
			suite.toClean('wks', wksId);
			assert(Number.isInteger(wksId), 'wks id');
			wks = await wksDao.get(suite.adminCtx, wksId);
			strictEqual(wks.name, 'test-dao-basic-crud-wks_wks-01');
			const mtime1 = wks.mtime!;

			// test update 
			await wait(10); // very short wait to make sure create/updatetime is not the same
			await wksDao.update(suite.sysCtx, wksId, { name: 'test-dao-basic-crud-wks_wks-01-updated' });
			wks = await wksDao.get(suite.adminCtx, wksId);
			strictEqual(wks.name, 'test-dao-basic-crud-wks_wks-01-updated');
			const mtime2 = wks.mtime!;

			//// check the timestamp
			// the modify time should have been modify from before
			assert.notStrictEqual(mtime2, mtime1, 'modify time');
			// make sure the ctime and mtime is different
			assert.notStrictEqual(wks.ctime, wks.mtime, 'ctime vs mtime');
			// check that the .mid and .cid
			strictEqual(wks.cid, suite.adminCtx.userId);
			strictEqual(wks.mid, suite.sysCtx.userId);

			// test list
			const wkss = await wksDao.list(suite.adminCtx, { access: 'wa_content_view', matching: { name: 'test-dao-basic-crud-wks_wks-01-updated' } });
			strictEqual(wkss[0].name, 'test-dao-basic-crud-wks_wks-01-updated');


		} catch (ex) {
			throw ex;
		}
	});

});