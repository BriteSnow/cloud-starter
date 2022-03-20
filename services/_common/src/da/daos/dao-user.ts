import { UserContext } from '../../user-context.js';
import { knexQuery } from '../db.js';
import type { UserForCreate } from '../records/user-rec.js';
import { BaseDao } from './dao-base.js';
const { freeze } = Object;

// To allow checking or deleting these properties for regular apis
const USER_SECURITY_COLUMNS = freeze(['pwd', 'psalt', 'tsalt']);
// For auth and access
const USER_COLUMNS_FOR_AUTH = freeze(['id', 'uuid', 'username', 'role', 'accesses', 'tsalt']);

// Default user columns
const USER_COLUMNS_DEFAULT = freeze(['id', 'uuid', 'username', 'fullName']);

class UserDao extends BaseDao {

  constructor() {
    super({
      table: 'user',
      stamped: true,
      idNames: 'id',
      columns: USER_COLUMNS_DEFAULT
    });
  }

  async createUser(utx: UserContext, data: UserForCreate): Promise<void> {

    // first we create the new user
    const { query } = await knexQuery({ utx, tableName: this.table });

    const dataUser = BaseDao.Stamp(utx, data, true);

    // NOTE: By default, thereturning this.idNames is .id
    const userId = (await query.insert(dataUser).returning(this.idNames as 'id'))[0].id as number;

    console.log('->> will createUser ', dataUser, userId);
  }

}

export const userDao = new UserDao();