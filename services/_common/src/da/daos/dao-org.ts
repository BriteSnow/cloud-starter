import { TIMESTAMPS_COLUMNS } from '../records/bases.js';
import { BaseDao } from './dao-base.js';
const { freeze } = Object;


const ORG_COLUMNS_DEFAULT = freeze(['id', 'uuid', 'name', 'type', ...TIMESTAMPS_COLUMNS])

class UserDao extends BaseDao {
  constructor() {
    super({
      table: 'user',
      stamped: true,
      idNames: 'id',
      columns: ORG_COLUMNS_DEFAULT
    });
  }
}