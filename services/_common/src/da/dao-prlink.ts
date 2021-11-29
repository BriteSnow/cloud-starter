import { UserContext } from '../user-context.js';
import { AccessRequires } from './access.js';
import { BaseDao } from './dao-base.js';

export interface Prlink {
	id: number;
	userId: number;
	cid: number;
	ctime: string;
	code: string;
	clickFirst: string; // first time click time
	clickLast: string; // last time click time
}

export class PrlinkDao extends BaseDao<Prlink, number>{
	constructor() {
		super({ table: 'rplink', stamped: false });
	}

	@AccessRequires('a_pwd_reset')
	async create(utx: UserContext, data: Pick<Prlink, 'id'>) {
		return super.create(utx, data);
	}
}
