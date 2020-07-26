import * as assert from 'assert';
import { saveWksRole } from 'common/da/access-wks';
import { wksDao } from 'common/da/daos';
import { initSuite } from './t-utils';

/**
 * Test some basic crud operations with timestamps and all from admin (to access testing)
 *
 */

describe("test-dao-wks", async function () {

	const suite = initSuite(this);

	it('dao-wks-get-owners', async function () {
		try {

			//// SETUP
			// create wks (container object)
			const wksId = await wksDao.create(suite.userACtx, { name: 'test-dao-basic-crud-ticket_wks-01' });
			suite.toClean('wks', wksId);
			// set userB as viewer
			await saveWksRole(suite.userBCtx.userId, wksId, 'wr_viewer');

			// test 
			const owners = await wksDao.getOwners(suite.sysCtx, wksId); // getOwner requires sysCtx for now. 
			assert.strictEqual(owners.length, 1, 'number of owners');
			assert.strictEqual(owners[0].id, suite.userACtx.userId, 'owner should be userA');
			assert.strictEqual(((<any>owners[0]).pwd == null), true, '.pwd should not be exposed');


		} catch (ex) {
			throw ex;
		}
	});

});