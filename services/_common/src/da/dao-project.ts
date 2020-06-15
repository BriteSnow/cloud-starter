import { Project, User } from 'shared/entities';
import { Monitor } from '../perf';
import { saveProle } from '../role-manager';
import { UserContext } from '../user-context';
import { AccessRequires } from './access';
import { BaseDao } from './dao-base';
import { knexQuery } from './db';

export class ProjectDao extends BaseDao<Project, number> {
	constructor() { super({ table: 'project', stamped: true }) }

	@AccessRequires(['#sys'])
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
	@Monitor()
	async create(utx: UserContext, data: Partial<Project>) {
		const projectId = await super.create(utx, data);

		await saveProle(utx.userId, projectId, 'owner');
		return projectId;
	}

	@AccessRequires(['#sys', '#admin', 'project-read'])
	async get(utx: UserContext, id: number) {
		return super.get(utx, id);
	}

	@AccessRequires(['#sys', '#admin', 'project-write'])
	async update(utx: UserContext, id: number, data: Partial<Project>) {
		return super.update(utx, id, data);
	}

	@AccessRequires(['#sys', '#admin', 'project-remove'])
	async remove(utx: UserContext, ids: number | number[]) {
		return super.remove(utx, ids);
	}
	//#endregion ---------- /BaseDao Overrides ---------- 
}