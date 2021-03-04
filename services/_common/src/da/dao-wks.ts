import { assertWksAccess, WksAccess, WKS_ROLES, WKS_ROLES_BY_ACCESS } from 'shared/access-types';
import { QueryOptions, User, Wks } from 'shared/entities';
import { Err } from '../error';
import { Monitor } from '../perf';
import { UserContext } from '../user-context';
import { symbolDic } from '../utils';
import { AccessRequires } from './access';
import { saveWksRole } from './access-wks';
import { BaseDao } from './dao-base';
import { knexQuery } from './db';


const ERROR = symbolDic(
	'LIST_FAIL_NO_WKS_ROLE'
);

export const WKS_COLUMNS = Object.freeze(['id', 'cid', 'ctime', 'mid', 'mtime', 'name'] as const);

/** WksQueryOptions MUST defined the required WksAccess for the query */
export interface WksQueryOptions extends QueryOptions<Wks> {
	access: WksAccess
}

export class WksDao extends BaseDao<Wks, number, WksQueryOptions> {
	constructor() { super({ table: 'wks', stamped: true }) }

	//#region    ---------- Entity Processing ---------- 
	protected parseRecord(obj: any): Wks {
		const entity = super.parseRecord(obj) as any;

		// If .wrole create the WksAccesses object from the role
		if (entity.wrole) {
			const accessList = WKS_ROLES.get(entity.wrole) as Readonly<WksAccess[]>;
			entity.accesses = Object.freeze(accessList?.reduce(
				(acc, val) => { acc[val] = true; return acc },
				{} as { [key in WksAccess]?: true }));

			// remove the wrole, nobody should use it after this.
			delete entity['wrole'];
		}

		return entity as Wks;
	}
	//#endregion ---------- /Entity Processing ---------- 


	@AccessRequires('a_admin', 'wa_user_assign_admin')
	async getOwners(utx: UserContext, wksId: number): Promise<User[]> {
		const { query } = await knexQuery({ utx, tableName: 'user' });

		// select "user".* from "user" right join user_wks on "user".id = user_wks."userId"
		//    where "wksId" = 1000 and user_wks.name = 'owner';
		const r: any[] = await query.column('user.*').rightJoin('user_wks', 'user.id', 'user_wks.userId')
			.where({ wksId, 'user_wks.name': 'owner' });

		// TODO: need to make it generic to dao (to cleanup data from db)
		r.forEach(user => { delete user.pwd });
		return r;
	}

	//#region    ---------- BaseDao Overrides ---------- 
	@AccessRequires('a_admin', 'wa_content_view')
	async get(utx: UserContext, id: number) {
		return super.get(utx, id);
	}

	@AccessRequires('a_admin', 'wa_content_view')
	@Monitor()
	async list(utx: UserContext, queryOptions?: WksQueryOptions): Promise<Wks[]> {
		const queryAccess = queryOptions?.access;

		//// if #sys or a_admin global access, query all
		if (utx.hasAccess('#sys') || utx.hasAccess('a_admin')) {
			return super.list(utx, queryOptions);
		}
		//// otherwise, if queryAccess, has to be wks scoped
		else if (queryAccess === 'wa_content_view') { // check that it matches the @AccessRequires of the method
			// make sure valid access
			assertWksAccess(queryAccess);

			// get wks roles for this access
			// Note: for now, just store wks roles in deb, so, we have to reverse access to roles to make appropriate query
			const roles = WKS_ROLES_BY_ACCESS.get(queryAccess)!; // safe as we know wa_content_view has roles

			const { query } = await knexQuery({ utx, tableName: this.table });
			query.columns(WKS_COLUMNS.map(n => `wks.${n}`));
			query.column('user_wks.role as role');
			this.completeQueryBuilder(utx, query, queryOptions);
			query.join('user_wks', 'wks.id', 'user_wks.wksId');
			// NOTE: These both where and whereIn, will be correctly AND
			query.where({
				'user_wks.userId': utx.userId,
			});
			query.whereIn('user_wks.role', roles);
			const records = await query;

			return this.parseRecords(records);
		}
		//// otheriwise, throw error
		else {
			throw new Err(ERROR.LIST_FAIL_NO_WKS_ROLE, `Cannot do productDao.list for user ${utx.userId} - No wks role found for access ${queryAccess}`);
		}

	}

	@AccessRequires('#user') // any user can create a new wks, it will be the wr_owner
	@Monitor()
	async create(utx: UserContext, data: Partial<Wks>) {
		const wksId = await super.create(utx, data);

		await saveWksRole(utx.userId, wksId, 'wr_owner');
		return wksId;
	}



	@AccessRequires('a_admin', 'wa_content_edit')
	async update(utx: UserContext, id: number, data: Partial<Wks>) {
		return super.update(utx, id, data);
	}

	@AccessRequires('a_admin', 'wa_delete')
	async remove(utx: UserContext, ids: number | number[]) {
		return super.remove(utx, ids);
	}
	//#endregion ---------- /BaseDao Overrides ---------- 
}

