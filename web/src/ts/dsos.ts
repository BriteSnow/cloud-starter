import { ajaxGet as webGet, ajaxPost as webPost, ajaxPut as webPut, ajaxDelete as webDelete, ajaxPatch as webPatch } from './ajax';
import { hub } from 'mvdom';
import { Project, Ticket, Label, Filter, TicketFilter, Pane, ProjectEntityFilter } from 'shared/entities';

const dsoHub = hub('dsoHub');

class BaseDso<E, F> {

	private _entityType: string;

	constructor(type: string) {
		this._entityType = type;
	}

	async get(id: number): Promise<E> {
		const result = await webGet(`/api/crud/${this._entityType}/${id}`);
		if (result.success) {
			return result.data;
		} else {
			throw result;
		}
	}

	async list(filter?: F): Promise<E[]> {
		const result = await webGet(`/api/crud/${this._entityType}`, filter);
		if (result.success) {
			return result.data as any[];
		} else {
			throw result;
		}
	}

	async create(props: any): Promise<number> {
		const result = await webPost(`/api/crud/${this._entityType}`, props);
		const entity = result.data;
		if (result.success) {
			dsoHub.pub(this._entityType, 'create', entity);
			return entity;
		} else {
			throw result;
		}
	}

	async update(id: number, props: Partial<E>): Promise<any> {
		const result = await webPatch(`/api/crud/${this._entityType}/${id}`, props);
		const entity = result.data;
		if (result.success) {
			dsoHub.pub(this._entityType, 'update', entity);
			return entity;
		} else {
			throw result;
		}
	}
}

export const projectDso = new BaseDso<Project, Filter<Project>>('Project');


export const ticketDso = new BaseDso<Ticket, TicketFilter>('Ticket');

export const paneDso = new BaseDso<Pane, ProjectEntityFilter<Pane>>('Pane');

export interface LabelFilter extends Filter<Label> {
	projectId: number;
}
export const labelDso = new BaseDso<Label, LabelFilter>('Label');
