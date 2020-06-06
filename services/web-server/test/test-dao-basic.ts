import { strictEqual } from 'assert';
import { projectDao } from 'common/da/daos';
import { Project } from 'shared/entities';
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

		//// cleanup existing test project
		let testProjects = await projectDao.list(ctx, { matching: { name: { op: 'ilike', val: 'test%' } } });
		if (testProjects.length > 0) {
			await projectDao.remove(ctx, testProjects.map(p => p.id));
		}
		testProjects = await projectDao.list(ctx, { matching: { name: { op: 'ilike', val: 'test%' } } });
		strictEqual(testProjects.length, 0);

		//// create test data
		await projectDao.create(ctx, { name: 'test - 001' });
		await projectDao.create(ctx, { name: 'test - 002' });
		await projectDao.create(ctx, { name: 'test - 003' });

		//// check the test data
		testProjects = await projectDao.list(ctx, { matching: { name: { op: 'ilike', val: 'test%' } } });
		strictEqual(testProjects.length, 3);

		//// delete one
		const p1 = testProjects.shift()!;
		let deleted = await projectDao.remove(ctx, p1.id);
		strictEqual(deleted, 1);
		testProjects = await projectDao.list(ctx, { matching: { name: { op: 'ilike', val: 'test%' } } });
		strictEqual(testProjects.length, 2);

		//// test delete the multiple 
		deleted = await projectDao.remove(ctx, testProjects.map(p => p.id));
		strictEqual(deleted, 2);
		testProjects = await projectDao.list(ctx, { matching: { name: { op: 'ilike', val: 'test%' } } });
		strictEqual(testProjects.length, 0);
	});

	it('dao-basic-crud-project', async function () {
		try {
			let project: Project | undefined;

			// test create
			const projectId = await projectDao.create(suite.adminCtx, { name: 'test-dao-basic-crud-project_project-01' });
			suite.toClean('project', projectId);
			assert(Number.isInteger(projectId), 'project id');
			project = await projectDao.get(suite.adminCtx, projectId);
			strictEqual(project.name, 'test-dao-basic-crud-project_project-01');
			const mtime1 = project.mtime!;

			// test update 
			await wait(10); // very short wait to make sure create/updatetime is not the same
			await projectDao.update(suite.sysCtx, projectId, { name: 'test-dao-basic-crud-project_project-01-updated' });
			project = await projectDao.get(suite.adminCtx, projectId);
			strictEqual(project.name, 'test-dao-basic-crud-project_project-01-updated');
			const mtime2 = project.mtime!;

			//// check the timestamp
			// the modify time should have been modify from before
			assert.notStrictEqual(mtime2, mtime1, 'modify time');
			// make sure the ctime and mtime is different
			assert.notStrictEqual(project.ctime, project.mtime, 'ctime vs mtime');
			// check that the .mid and .cid
			strictEqual(project.cid, suite.adminCtx.userId);
			strictEqual(project.mid, suite.sysCtx.userId);

			// test list
			const projects = await projectDao.list(suite.adminCtx, { matching: { name: 'test-dao-basic-crud-project_project-01-updated' } });
			strictEqual(projects[0].name, 'test-dao-basic-crud-project_project-01-updated');


		} catch (ex) {
			throw ex;
		}
	});

});