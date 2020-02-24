import { Project, User } from 'shared/entities';
import { saveProle } from '../role-manager';
import { UserContext } from '../user-context';
import { AccessRequires } from './access';
import { BaseDao } from './dao-base';
import { getKnex } from './db';

export class ProjectDao extends BaseDao<Project, number> {
	constructor() { super({ table: 'project', stamped: true }) }

	@AccessRequires(['#sys'])
	async getOwners(ctx: UserContext, projectId: number): Promise<User[]> {
		const k = await getKnex();

		// select "user".* from "user" right join user_prole on "user".id = user_prole."userId"
		//    where "projectId" = 1000 and user_prole.name = 'owner';
		const r: any[] = await k('user').column('user.*').rightJoin('user_prole', 'user.id', 'user_prole.userId')
			.where({ projectId, 'user_prole.name': 'owner' });

		// TODO: need to make it generic to dao (to cleanup data from db)
		r.forEach(user => { delete user.pwd });
		return r;
	}

	//#region    ---------- BaseDao Overrides ---------- 
	async create(ctx: UserContext, data: Partial<Project>) {
		const projectId = await super.create(ctx, data);

		await saveProle(ctx.userId, projectId, 'owner');
		return projectId;
	}

	@AccessRequires(['#sys', '#admin', 'project-read'])
	async get(ctx: UserContext, id: number) {
		return super.get(ctx, id);
	}

	@AccessRequires(['#sys', '#admin', 'project-write'])
	async update(ctx: UserContext, id: number, data: Partial<Project>) {
		return super.update(ctx, id, data);
	}

	@AccessRequires(['#sys', '#admin', 'project-remove'])
	async remove(ctx: UserContext, ids: number | number[]) {
		return super.remove(ctx, ids);
	}
	//#endregion ---------- /BaseDao Overrides ---------- 
}