import { QueryOptions, WksScopedEntity } from '#shared/entities.js';
import { Err } from '../error.js';
import { UserContext } from '../user-context.js';
import { symbolDic } from '../utils.js';
import { AccessRequires } from './access.js';
import { BaseDao, CustomQuery } from './dao-base.js';

const ERROR = symbolDic(
	'NO_WKSID_IN_UTX',
	'NO_MATCHING_WKSID_UTX_DATA'
)

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

	@AccessRequires('wa_content_edit', "@cid")
	async remove(utx: UserContext, id: I): Promise<number> {
		return super.remove(utx, id);
	}

	//#region    ---------- Wks Scoped Helper Methods ---------- 
	scopeQuery(utx: UserContext, queryOptions?: Q & CustomQuery) {
		const wksId = utx.wksId;
		if (wksId == null) {
			throw new Err(ERROR.NO_WKSID_IN_UTX, `${this.constructor.name}.list`);
		}
		// TS NOTE: Here, cannot use Q, TS can't infer correctly.
		const wksScopedQueryOptions: QueryOptions<E> & CustomQuery = queryOptions ?? {};
		wksScopedQueryOptions.matching = wksScopedQueryOptions.matching ?? {};
		wksScopedQueryOptions.matching.wksId = wksId;
	}

	scopeData(utx: UserContext, data?: Partial<WksScopedEntity>) {
		const wksId = utx.wksId;
		if (wksId == null) {
			throw new Err(ERROR.NO_WKSID_IN_UTX, `${this.constructor.name}.scopeData`);
		}

		// If we have a data id make sure the wksId match, and if not present in data, set it
		if (data != null) {
			if (data.wksId != null && data.wksId !== wksId) {
				throw new Err(ERROR.NO_MATCHING_WKSID_UTX_DATA, `${this.constructor.name}.scopeData UTX.wksId ${wksId} does not match data.wksId ${data.wksId}`);
			}
			// set the wks
			data.wksId = wksId;
		}
	}
	//#endregion ---------- /Wks Scoped Helper Methods ---------- 

}
