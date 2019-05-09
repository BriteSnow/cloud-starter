import { getKnex } from './db';
import { Context } from '../context';
import { Monitor } from '../perf';
import { Filter, ProjectEntityFilter, StampedEntity } from 'shared/entities';
import { QueryBuilder } from 'knex';
import { nowTimestamp } from '../utils';


// Note: for now, the knex can take a generic I for where value
// @annoC
export class BaseDao<E, I, F extends Filter<E> = Filter<E>> {
	readonly tableName: string;
	readonly idNames: string | string[];
	readonly stamped: boolean;

	constructor(tableName: string, stamped: boolean, idNames?: string | string[]) {
		this.tableName = tableName;
		this.idNames = (idNames != null) ? idNames : 'id';
		this.stamped = stamped;
	}

	@Monitor()
	async get(ctx: Context, id: I): Promise<E> {
		const k = await getKnex();
		let q = k(this.tableName);

		const r = await q.where(this.getWhereIdObject(id));

		if (r.length === 0) {
			throw new Error(`dao.get error, can't find ${this.tableName}[${id}]`);
		}

		return r[0] as E;
	}

	@Monitor()
	async first(ctx: Context, data: Partial<E>): Promise<E | null> {
		const k = await getKnex();
		const r = await k(this.tableName).where(data);
		if (r.length === 0) {
			return null;
		}
		return r[0] as E;
	}

	@Monitor()
	async create(ctx: Context, data: Partial<E>): Promise<I> {
		const k = await getKnex();

		if (this.stamped) {
			// Force casting. We can assume this, might have a more elegant way (but should not need StampedDao though)
			const stampedData: StampedEntity = (<any>data) as StampedEntity;
			const now = nowTimestamp();
			stampedData.cid = ctx.userId;
			stampedData.ctime = now;
			stampedData.mid = ctx.userId;
			stampedData.mtime = now;
		}

		const r = await k(this.tableName).insert(data).returning(this.idNames);
		return r[0] as I;
	}

	@Monitor()
	async update(ctx: Context, id: I, data: Partial<E>) {
		const k = await getKnex();

		if (this.stamped) {
			// Force casting. We can assume this, might have a more elegant way (but should not need StampedDao though)
			const stampedData: StampedEntity = (<any>data) as StampedEntity;
			const now = nowTimestamp();
			stampedData.mid = ctx.userId;
			stampedData.mtime = now;
		}

		const r = await k(this.tableName).update(data).where(this.getWhereIdObject(id));
		return r;
	}

	@Monitor()
	async list(ctx: Context, filter?: F): Promise<E[]> {
		const k = await getKnex();
		let q = k(this.tableName);
		this.completeQueryBuildWithFilter(q, filter);

		const entities = await q.then(); // TODO: need to check if this is the common way
		return entities as E[];
	}

	@Monitor()
	async remove(ctx: Context, id: I) {
		const k = await getKnex();
		return k(this.tableName).delete().where(this.getWhereIdObject(id));
	}

	protected completeQueryBuildWithFilter(q: QueryBuilder, filter?: F) {
		if (filter && filter.matching) {
			q = q.where(filter.matching);
		}
	}


	private getWhereIdObject(id: any) {
		// otherwise, build the object with all of the appropriate id
		const r: any = {};

		const t = typeof id;

		// if the id value is a scalar number/string, then, check and return the appropriate object
		if (t === 'number' || t === 'string') {
			if (this.idNames instanceof Array) {
				throw new Error(`Dao for ${this.tableName} has composite ids ${this.idNames} but method passed only one parameter ${id}`);
			}
			const name = this.idNames as string;
			r[name] = id;
		}

		else {
			for (const name of this.idNames) {
				const val = id[name];
				if (val == null) {
					throw new Error(`Dao for ${this.tableName} requires id property ${name}, but not present it ${id}`);
				}
				r[name] = val;
			}
		}

		return r;

	}
}

export class ProjectEntityDao<E, I> extends BaseDao<E, I, ProjectEntityFilter<E>> {

	protected completeQueryBuildWithFilter(q: QueryBuilder, filter: ProjectEntityFilter<E>) {
		super.completeQueryBuildWithFilter(q, filter);
		q.where('projectId', filter.projectId);
	}

}