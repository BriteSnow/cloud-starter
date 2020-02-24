import { ok, strictEqual } from 'assert';
import { userDao } from 'common/da/daos';
import { getSysContext } from 'common/user-context';

/**
 * Test some basic crud operations with timestamps and all from admin (to access testing)
 *
 */

describe("test-dao-user", async function () {


	it('dao-user-get-admin', async function () {
		try {
			const ctx = await getSysContext();

			const admin = await userDao.get(ctx, 1);
			strictEqual(admin.id, 1);

		} catch (ex) {
			throw ex;
		}
	});

	it('dao-user-list-users', async function () {
		try {
			const ctx = await getSysContext();

			const admins = await userDao.list(ctx);
			ok(admins.length > 0);

		} catch (ex) {
			throw ex;
		}
	});
});