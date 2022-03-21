import { userDao } from '#common/da/daos/dao-user.js';
import { assertTicketForPatch } from '#common/ts-schema/assert-schema.js';
import { v4 as uuidV4 } from 'uuid';
import { initSuite } from '../../t-utils.js';

describe("da_user", function () {

  const suite = initSuite(this);


  it('da_user_simple', async function () {

    console.log('->> TODO need to do da user test simple!!!!',);

    assertTicketForPatch({ title: "afsd", bar: 123, foo: true });

    await userDao.createUser(suite.sysCtx, { username: "test_user_" + uuidV4() });
  });

});