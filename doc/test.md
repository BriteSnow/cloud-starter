
Tests use the [mocha](https://mochajs.org/) framework with the following structure and best practices. 

> Obvious but important, in all naming convention, no space, only '-' separated for names, and camel case for variables. 

See: 
- [services/web-server/test/test-access-project.ts](services/web-server/test/test-access-project.ts) for an example of a test file.
- [services/web-server/test/t-utils.ts](services/web-server/test/t-utils.ts) (test utilities, decribed below)


**Test File naming (e.g., `services/web-server/test-access-project.ts`)**

- Each test files are under the `test/` folder of their repective service, and all start with the prefix `test-`
- First word after `test-` is the functionality tested, and the following words are for more precision. 
- Basic functionality test should be used `-basic`, such as `test-access-basic.ts` will test the basic of test, where has `test-access-project.ts` will do more test focused on `project` entity access. This allows run the basic test (with mocha `-g`) without having to run all of the test for a given functionality.
- Test utils files are named with `t-...ts`, such as `t-utils.ts` so that they are ran by the Mocha tester, and not confused with real code. 


**Suite naming (e.g., `describe('test-access-project',`**

- A Mocha test suite is defined by `describe` and the name should match the name of the file without the `.ts` extension
- We have ONE test suite (one `decribe`) by `test-...ts` file.


**Test naming (e.g., `it('access-project-viewer', `**

- A Mocha test is defined by `it` and the name should  have the following format
	- Starts with the suite/file name without the `test-` prefix, like `access-project`
	- Add one of more descriptive to concisely identify the test (something short, but meaningfull for making test report as meaningfull as possible)
	- For example for suite `test-access-project` we will have `it('access-project-viewer'` that test the viewer access, and `it('access-project-manager'` for the manager access. 

**Suite initialization**

Each test suite must call the `initSuite` in there describe and assign it to a `suite` variable

```ts
describe("test-access-project", async function () {

	const suite = initSuite(this);

	// test CRUD  project from same user (i.e. owner)
	it('access-project-self', async function () {
		
		// suite has default set of  have a default set of user `context` avail
		suite.adminCtx
		suite.userACtx;
		suite.userCtx;

		const projectId = await daoProject.create(suite.adminCtx, ({name: 'test-project-01'}));

		// suite expose a method to queue entity (tableName/id) that need to be cleanup after this test
		suite.toClean('project', id);
	}
});
```	

`initSuite` is from [services/web-server/test/t-utils.ts](services/web-server/test/t-utils.ts) and extends the `Mocha.Suite` with  application common test setup and tear down. Here is the snipet of the `t-utils.ts` 


**Test structure**

The naming of the test needs to match the suite/test file (see first sections on naming) and should have the following structure: 

- The first blocks of a test can setup the data (here `create project` and `assign role`), and each block need to have a clear one line comment.
- When creating new entity, they need to be queued to be cleaned after the test with `suite.toClean(tableName, id)`
- Each sub test should have a one liner starting with `// test ...` and ending with `, should work` or `, should fail` (consistency is important)
- When asserting for `assert.rejects` (promise), favor `RegExp` way, as below (use function only if really needed)
- `assert.rejects` validation `RegExp` and `message` should be in there new line, so that it is easy to see the function called.
- Each sub-test should have its own block (one line comment, few line of create and asserts) and empty line. 
- If test need extra cleanup (not provided by `suite.toClean`), the test code needs to be in `try/catch` and the cleanup happen in `finally` (hopefully this is not too needed, we might find a better way later). 


Here is an example of a good test: 

```ts
	// test CRUD project access from a viewer user
	it('access-project-viewer', async function () {

		// create project from userA, should work
		let testProject01Id = await projectDao.create(suite.userACtx, { name: 'test-access-project-01' });
		suite.toClean('project', testProject01Id);

		// assign 'viewer' role to userB
		await saveProle(suite.userBCtx.userId, testProject01Id, 'viewer');

		// test read from userB, should work
		const testProject01 = await projectDao.get(suite.userBCtx, testProject01Id);
		assert.strictEqual(testProject01.name, 'test-access-project-01');

		// test update from userB, should fail
		await assert.rejects(projectDao.update(suite.userBCtx, testProject01Id, { name: 'test-access-project-01-updated' }),
			suite.errorNoAccess, 'UserB schould not have write access to userA project');

		// test remove from userB, should fail
		await assert.rejects(projectDao.remove(suite.userBCtx, testProject01Id),
			suite.errorNoAccess, 'UserB schould not have remove access to userA project');
	});
```





