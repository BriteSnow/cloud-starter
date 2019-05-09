import { Ticket, TicketFilter } from 'shared/entities';
import { Context } from '../context';
import { BaseDao } from './dao-base';
import { getKnex } from './db';

export class TicketDao extends BaseDao<Ticket, number> {
	constructor() { super('ticket', true) }

	async list(ctx: Context, filter?: TicketFilter): Promise<Ticket[]> {
		const k = await getKnex();
		let q = k(this.tableName);

		// columns we want to select
		const columns = {
			'id': 'ticket.id',
			'projectId': 'ticket.projectId',
			'cid': 'ticket.cid',
			'ctime': 'ticket.ctime',
			'title': 'ticket.title',
			'ghId': 'ticket.ghId',
			'ghNumber': 'ticket.ghNumber',
			'label_id': 'l.id',
			'label_name': 'l.name',
			'label_color': 'l.color'
		}
		q.columns(columns);


		// Add the filter is present
		if (filter) {
			// TicketFilter always had a .projectId
			q.where('ticket.projectId', filter.projectId);

			// for now only support the filter.matching
			if (filter.matching) {
				// de-ambiguitate matching, for now, only support ticket matching
				const matching = Object.entries(filter.matching).reduce((acc: any, kv: any[]) => {
					acc['ticket.' + kv[0]] = kv[1];
					return acc;
				}, {});

				q = q.where(matching);
			}

			// include the labels
			if (filter.labelIds && filter.labelIds.length > 0) {
				q.whereIn('tl.labelId', filter.labelIds);
			}
		}


		// make the join up to the label table (many to many on the middle) 
		q = q.leftJoin('ticket_label as tl', 'ticket.id', 'tl.ticketId');
		q = q.leftJoin('label as l', 'tl.labelId', 'l.id');

		//const sql = q.toSQL().sql; // usefull for debug

		// do the query (need cast here)
		const records = await q.then() as any[];

		// reduce the records to be per tickets and merge the labels and such
		// Note: here we use a Map<number, ticket> (ticketByTicketId) accumulator to reduce the number of ticket entities created
		const entities: Map<number, Ticket> = records.reduce((acc: Map<number, Ticket>, r: any) => {
			const rId = r.id;
			let ticket = acc.get(rId);

			// if we do not have a ticket yet, we extract the information and create it
			if (ticket == null) {
				ticket = {
					id: rId,
					projectId: r.projectId,
					title: r.title,
					ghId: r.ghId,
					ghNumber: r.ghNumber,
					labels: []
				}
				acc.set(rId, ticket);
			}

			if (r.label_id) {
				ticket.labels!.push({
					id: r.label_id,
					name: r.label_name,
					color: r.label_color
				});
			}

			return acc;

		}, new Map<number, Ticket>());

		// return the values fof the map as array
		return Array.from(entities.values());

	}
}