import { userDao } from '#common/da/daos/dao-user.js';
import { initSuite } from '../../t-utils.js';

describe("da_user", function () {

  const suite = initSuite(this);

  it('da_user_simple', async function () {



    console.log('->> TODO need to do da user test simple!!!!',);

    await userDao.createUser(suite.sysCtx, { username: "test_user-2" });
  });

});