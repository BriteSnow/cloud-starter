// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/frontends/web/src/ts/dco-base.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { hub } from 'dom-native';
import { webDelete, webGet, webPatch, webPost } from './web-request';


export const dcoHub = hub('dcoHub');

export class BaseDco<E, F> {

	protected _entityType: string;

	constructor(type: string) {
		this._entityType = type;
	}

	//#region    ---------- Utils ---------- 

	//#endregion ---------- /Utils ---------- 
	async get(id: number): Promise<E> {
		const result = await webGet(`/api/dse/${this._entityType}/${id}`);
		if (result.success) {
			return result.data;
		} else {
			throw result;
		}
	}

	async list(filter?: F): Promise<E[]> {
		const result = await webGet(`/api/dse/${this._entityType}`, { params: filter });
		if (result.success) {
			return result.data as any[];
		} else {
			throw result;
		}
	}

	async create(props: any): Promise<E> {
		const result = await webPost(`/api/dse/${this._entityType}`, { body: props });
		const entity = result.data;
		if (result.success) {
			dcoHub.pub(this._entityType, 'create', entity);
			return entity;
		} else {
			throw result;
		}
	}

	async update(id: number, props: Partial<E>): Promise<any> {
		const result = await webPatch(`/api/dse/${this._entityType}/${id}`, { body: props });
		const entity = result.data;
		if (result.success) {
			dcoHub.pub(this._entityType, 'update', entity);
			return entity;
		} else {
			throw result;
		}
	}

	async remove(id: number): Promise<boolean> {
		const result = await webDelete(`/api/dse/${this._entityType}/${id}`);
		if (result.success) {
			dcoHub.pub(this._entityType, 'remove', id);
			return true;
		} else {
			throw result;
		}
	}
}
