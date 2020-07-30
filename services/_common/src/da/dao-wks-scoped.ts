import { QueryOptions, WksScopedEntity } from 'shared/entities';
import { AppError } from '../error';
import { UserContext } from '../user-context';
import { AccessRequires } from './access';
import { BaseDao, CustomQuery } from './dao-base';



export class WksScopedDao<E extends WksScopedEntity, I, Q extends QueryOptions<E> = QueryOptions<E>> extends BaseDao<E, I, Q>  {

	@AccessRequires('wa_content_view')
	async get(utx: UserContext, id: I): Promise<E> {
		this.scopeData(utx);
		return super.get(utx, id);
	}

	@AccessRequires('wa_content_create')
	async create(utx: UserContext, data: Partial<E>): Promise<I> {
		this.scopeData(utx, data);
		return super.create(utx, data)
	}

	@AccessRequires('wa_content_edit', "@cid")
	async update(utx: UserContext, id: I, data: Partial<E>) {
		this.scopeData(utx, data);
		return super.update(utx, id, data);
	}

	@AccessRequires('wa_content_edit', "@cid")
	async list(utx: UserContext, queryOptions?: Q & CustomQuery): Promise<E[]> {
		this.scopeQuery(utx, queryOptions);
		return super.list(utx, queryOptions);
	}


	//#region    ---------- Wks Scoped Helper Methods ---------- 
	scopeQuery(utx: UserContext, queryOptions?: Q & CustomQuery) {
		const wksId = utx.wksId;
		if (wksId == null) {
			throw new AppError(`${this.constructor.name}.list - cannot list WksScoped entities, no wksId in utx`);
		}
		// TS NOTE: Here, cannot use Q, TS can't infer correctly.
		const wksScopedQueryOptions: QueryOptions<E> & CustomQuery = queryOptions ?? {};
		wksScopedQueryOptions.matching = wksScopedQueryOptions.matching ?? {};
		wksScopedQueryOptions.matching.wksId = wksId;
	}

	scopeData(utx: UserContext, data?: Partial<WksScopedEntity>) {
		const wksId = utx.wksId;
		if (wksId == null) {
			throw new AppError(`${this.constructor.name} require UTX to have .wksId, but not found in utx`)
		}

		// If we have a data id make sure the wksId match, and if not present in data, set it
		if (data != null) {
			if (data.wksId != null && data.wksId !== wksId) {
				throw new AppError(`${this.constructor.name} UTX.wksId ${wksId} does not match data.wksId ${data.wksId}`);
			}
			// set the wks
			data.wksId = wksId;
		}
	}
	//#endregion ---------- /Wks Scoped Helper Methods ---------- 

}


