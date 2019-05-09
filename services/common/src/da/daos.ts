import { Label, OAuth, Project, TicketLabel, User, Pane } from 'shared/entities';
import { Context } from '../context';
import { AccessRequires } from './access';
import { BaseDao, ProjectEntityDao } from './dao-base';
import { TicketDao } from './dao-TicketDao';
import { ProjectDao } from './dao-project';


export * from 'shared/entities';

class UserDao extends BaseDao<User, number>{
	constructor() {
		super('user', true);
	}

	async getByUsername(ctx: Context, username: string) {
		return super.first(ctx, { username });
	}


	//#region    ---------- BaseDao Overrides ---------- 

	// For now, we allow anybody to call this for registration. 
	@AccessRequires(['#sys', '#admin'])
	async create(ctx: Context, data: Partial<User>) {
		if (!data.type) { // make the default type user
			data.type = 'user';
		}
		return super.create(ctx, data);
	}

	@AccessRequires(['#sys', '#admin'])
	async remove(ctx: Context, id: number) {
		return super.remove(ctx, id);
	}

	@AccessRequires(['#sys', '#admin', '@id'])
	async update(ctx: Context, id: number, data: Partial<User>) {
		return super.update(ctx, id, data);
	}
	//#endregion ---------- /BaseDao Overrides ---------- 



}
export const userDao = new UserDao();


export const projectDao = new ProjectDao();

export const ticketDao = new TicketDao();

export const paneDao = new ProjectEntityDao<Pane, number>('pane', true);

export const oauthDao = new BaseDao<OAuth, number>('oauth', false);

export const labelDao = new ProjectEntityDao<Label, number>('label', true);

export type TicketLabelId = { ticketId: number, labelId: number };
export const ticketLabelDao = new BaseDao<TicketLabel, TicketLabelId>('ticket_label', true, ['ticketId', 'labelId']);

export const daoByEntity: { [type: string]: BaseDao<any, any> } = {
	User: userDao,
	Project: projectDao,
	Label: labelDao,
	Ticket: ticketDao,
	TicketLabel: ticketLabelDao,
	Pane: paneDao
}

