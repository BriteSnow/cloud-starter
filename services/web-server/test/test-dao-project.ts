import * as assert from 'assert';
import { saveProjectRole } from 'common/da/access-project';
import { projectDao } from 'common/da/daos';
import { initSuite } from './t-utils';

/**
 * Test some basic crud operations with timestamps and all from admin (to access testing)
 *
 */

describe("test-dao-project", async function () {

	const suite = initSuite(this);

	it('dao-project-get-owners', async function () {
		try {

			//// SETUP
			// create project (container object)
			const projectId = await projectDao.create(suite.userACtx, { name: 'test-dao-basic-crud-ticket_project-01' });
			suite.toClean('project', projectId);
			// set userB as viewer
			await saveProjectRole(suite.userBCtx.userId, projectId, 'pr_viewer');

			// test 
			const owners = await projectDao.getOwners(suite.sysCtx, projectId); // getOwner requires sysCtx for now. 
			assert.strictEqual(owners.length, 1, 'number of owners');
			assert.strictEqual(owners[0].id, suite.userACtx.userId, 'owner should be userA');
			assert.strictEqual(((<any>owners[0]).pwd == null), true, '.pwd should not be exposed');


		} catch (ex) {
			throw ex;
		}
	});

});