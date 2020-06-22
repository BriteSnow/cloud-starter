import { assertProjectAccess, ProjectAccess, PROJECT_ROLES, PROJECT_ROLES_BY_ACCESS } from 'shared/access-types';
import { Project, QueryOptions, User } from 'shared/entities';
import { AppError } from '../error';
import { Monitor } from '../perf';
import { UserContext } from '../user-context';
import { AccessRequires } from './access';
import { saveProjectRole } from './access-project';
import { BaseDao } from './dao-base';
import { knexQuery } from './db';


export const PROJECT_COLUMNS = Object.freeze(['id', 'cid', 'ctime', 'mid', 'mtime', 'name'] as const);

/** ProjectQueryOptions MUST defined the required ProjectAccess for the query */
export interface ProjectQueryOptions extends QueryOptions<Project> {
	access: ProjectAccess
}

export class ProjectDao extends BaseDao<Project, number, ProjectQueryOptions> {
	constructor() { super({ table: 'project', stamped: true }) }


	//#region    ---------- Entity Processing ---------- 
	protected parseRecord(obj: any): Project {
		const entity = super.parseRecord(obj) as any;

		// If .prole create the ProjectAccesses object from the role
		if (entity.prole) {
			const accessList = PROJECT_ROLES.get(entity.prole) as Readonly<ProjectAccess[]>;
			entity.accesses = Object.freeze(accessList?.reduce(
				(acc, val) => { acc[val] = true; return acc },
				{} as { [key in ProjectAccess]?: true }));

			// rmove the prole, nobody should use it after this.
			delete entity['prole'];
		}

		return entity as Project;
	}
	//#endregion ---------- /Entity Processing ---------- 


	@AccessRequires('a_admin', 'pa_user_assign_admin')
	async getOwners(utx: UserContext, projectId: number): Promise<User[]> {
		const { query } = await knexQuery({ utx, tableName: 'user' });

		// select "user".* from "user" right join user_prole on "user".id = user_prole."userId"
		//    where "projectId" = 1000 and user_prole.name = 'owner';
		const r: any[] = await query.column('user.*').rightJoin('user_prole', 'user.id', 'user_prole.userId')
			.where({ projectId, 'user_prole.name': 'owner' });

		// TODO: need to make it generic to dao (to cleanup data from db)
		r.forEach(user => { delete user.pwd });
		return r;
	}

	//#region    ---------- BaseDao Overrides ---------- 
	@AccessRequires('a_admin', 'pa_view')
	async get(utx: UserContext, id: number) {
		return super.get(utx, id);
	}

	@AccessRequires('a_admin', 'pa_view')
	@Monitor()
	async list(utx: UserContext, queryOptions?: ProjectQueryOptions): Promise<Project[]> {
		const queryAccess = queryOptions?.access;

		//// if #sys or a_admin global access, query all
		if (utx.hasAccess('#sys') || utx.hasAccess('a_admin')) {
			return super.list(utx, queryOptions);
		}
		//// otherwise, if queryAccess, has to be project scoped
		else if (queryAccess === 'pa_view') { // check that it matches the @AccessRequires of the method
			// make sure valid access
			assertProjectAccess(queryAccess);

			// get project roles for this access
			// Note: for now, just store project roles in deb, so, we have to reverse access to roles to make appropriate query
			const roles = PROJECT_ROLES_BY_ACCESS.get(queryAccess)!; // safe as we know pa_view has roles

			const { query } = await knexQuery({ utx, tableName: this.table });
			query.columns(PROJECT_COLUMNS.map(n => `project.${n}`));
			query.column('user_prole.role as prole');
			this.completeQueryBuilder(utx, query, queryOptions);
			query.join('user_prole', 'project.id', 'user_prole.projectId');
			// NOTE: These both where and whereIn, will be correctly AND
			query.where({
				'user_prole.userId': utx.userId,
			});
			query.whereIn('user_prole.role', roles);
			const records = await query;

			return this.parseRecords(records);
		}
		//// otheriwise, throw error
		else {
			throw new AppError(`Cannot do productDao.list for user ${utx.userId} - No project role found for access ${queryAccess}`);
		}

	}

	@AccessRequires('#user') // any user can create a new project, it will be the pr_owner
	@Monitor()
	async create(utx: UserContext, data: Partial<Project>) {
		const projectId = await super.create(utx, data);

		await saveProjectRole(utx.userId, projectId, 'pr_owner');
		return projectId;
	}



	@AccessRequires('a_admin', 'pa_edit')
	async update(utx: UserContext, id: number, data: Partial<Project>) {
		return super.update(utx, id, data);
	}

	@AccessRequires('a_admin', 'pa_delete')
	async remove(utx: UserContext, ids: number | number[]) {
		return super.remove(utx, ids);
	}
	//#endregion ---------- /BaseDao Overrides ---------- 
}