// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/services/common/src/da/dao-base.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { QueryBuilder } from 'knex';
import { Filter, OpVal, QueryOptions, StampedEntity, Val } from 'shared/entities';
import { Context } from '../context';
import { Monitor } from '../perf';
import { nowTimestamp } from '../utils-cloud-starter';
import { getKnex } from './db';

export interface CustomQuery {
	custom?: (q: QueryBuilder<any, any>) => void;
}

export interface BaseDaoOptions {
	table: string;
	stamped: boolean;
	idNames?: string | string[];
	/** set the default orderBy. '!' prefix make it DESC. .e.g., 'odr' or '!age' */
	orderBy?: string | null;
	/** Fix the column names for this DAO (get, first, list will filter through those)  */
	columns?: string[];
}

// Note: for now, the knex can take a generic I for where value
// @annoC
export class BaseDao<E, I, Q extends QueryOptions<E> = QueryOptions<E>> {
	readonly tableName: string;
	readonly idNames: string | string[];
	protected readonly stamped: boolean;
	protected readonly orderBy: string | null;
	protected readonly columns?: string[];

	constructor(opts: BaseDaoOptions) {
		this.tableName = opts.table;
		this.stamped = opts.stamped;
		this.idNames = (opts.idNames) ? opts.idNames : 'id';
		this.orderBy = (opts.orderBy) ? opts.orderBy : null;
		if (opts.columns) {
			this.columns = opts.columns;
		}
	}

	/**
	 * Convenient methods to process a list of object to this entity. 
	 * 
	 * MUST NOT BE OVERRIDEN, override processEntity instead.
	 * 
	 * @param objects 
	 */
	processEntities(objects: any[]): E[] {
		return objects.map(obj => this.processEntity(obj));
	}

	/**
	 * Process a data from the db into a full entity type.
	 * Overriden by the sub Dao as needed. 
	 * 
	 * Note: usually, this can hadd some defineProperty to get some data from computation
	 */
	processEntity(obj: any): E {
		return obj as E;
	}

	@Monitor()
	async get(ctx: Context, id: I): Promise<E> {
		const k = await getKnex();
		let q = k(this.tableName);
		if (this.columns) {
			q.columns(this.columns);
		}
		const r = await q.where(this.getWhereIdObject(id));

		if (r.length === 0) {
			throw new Error(`dao.get error, can't find ${this.tableName}[${id}]`);
		}
		return this.processEntity(r[0]);
	}

	/**
	 * Same as getForIds, but allow some array item to be undefined, and when so, undefined will be returned.
	 * @param ctx 
	 * @param ids 
	 */
	async getForSomeIds(ctx: Context, ids: (I | undefined)[]): Promise<(E | undefined)[]> {
		// first filter the none defined
		const definedIds = ids.filter(v => v !== undefined) as I[]; // help typing system
		// NOTE: here we forst the id property, as per limitationof this API
		const entities = await this.getForIds(ctx, definedIds);
		// NOTE: here we need to explicity set the correct type (typescript get it wrong :(, they are working on it)
		// NOTE: Also, here we assume that the entity as .id. Will  need to clean this up.
		const a = entities.map((ent: E) => [(<any>ent).id, ent]) as [number, E][];
		const entityById = new Map(a);

		// Note: assume number for ids so cast it
		return (<unknown>ids as number[]).map(id => (id !== undefined) ? entityById.get(id) : undefined);
	}

	/**
	 * Return a list of entity for a list of id. 
	 * - Assume the .id the id property of this entity (need to be generalized)
	 * - Assume .id is a number
	 * @param ctx 
	 * @param ids 
	 */
	async getForIds(ctx: Context, ids: I[]): Promise<E[]> {
		const k = await getKnex();
		let q = k(this.tableName);

		// for now only supports dao that have 'id' as key (i.e. assumption are numbers)
		if (this.idNames === 'id') {
			q.whereIn('id', (<any>ids) as number[]);
		} else {
			throw new Error(`Can't call getForIds on a dao that does not have 'id' and idNames ${this.constructor.name}`);
		}


		const r = (await q.then()) as any[];
		return this.processEntities(r);
	}

	@Monitor()
	async first(ctx: Context, data: Partial<E>): Promise<E | null> {
		const k = await getKnex();
		const q = k(this.tableName);
		const options = { matching: data, limit: 1 } as (QueryOptions<E> & Q); // needs typing int
		this.completeQueryBuilder(ctx, q, options);
		const entities = (await q.then()) as any[];

		// TODO: probably need to limit 1
		// TODO: should probably use the defaultOrderBy
		if (entities.length === 0) {
			return null;
		}
		return this.processEntity(entities[0]);
	}

	@Monitor()
	async create(ctx: Context, data: Partial<E>): Promise<I> {
		const k = await getKnex();

		this.stamp(ctx, data, true);

		const r = await k(this.tableName).insert(data).returning(this.idNames);
		return r[0] as I;
	}

	/**
	 * Try a create and if fail ON CONFLICT, return the id matching the uniqueProps name/values
	 * Note: this is not really an upsert because does not update anything if can't insert. 
	 * Note: Today, we do  not use the ... ON CONFLICT ... as returning 
	 * @param ctx 
	 * @param data 
	 * @param uniqueProps 
	 */
	async createOrGetId(ctx: Context, data: Partial<E>, uniqueProps: Partial<E>): Promise<I> {
		let id: I;
		try {
			id = await this.create(ctx, data);
		} catch (ex) {
			// for now,  we will assume it is on on conflict with the uniqueProp
			const k = await getKnex();
			const idNames = (this.idNames instanceof Array) ? this.idNames : [this.idNames];
			const r = await k(this.tableName).select().column(idNames).where(uniqueProps);

			if (r.length === 0) {
				const desc = `Can't get ${this.tableName} on unique props ${uniqueProps} after conflict create (conflict cause: ${ex.message})`;
				// TODO: need to enable when log framework get implemented
				// ctx.log({ level: 'error', method: 'BaseDao.silentCreate', desc });
				throw desc;
			}

			const val = r[0];
			id = (idNames.length === 1) ? val[idNames[0]] : val;
		}

		return id;
	}

	@Monitor()
	async update(ctx: Context, id: I, data: Partial<E>) {
		const k = await getKnex();

		this.stamp(ctx, data);

		const r = await k(this.tableName).update(data).where(this.getWhereIdObject(id));
		return r;
	}

	async updateBulk(ctx: Context, fn: (k: QueryBuilder<any, any>) => void, data: Partial<E>) {
		const k = await getKnex();
		const q = k(this.tableName).update(data);

		fn(q);

		this.stamp(ctx, data);

		const r = await q.then();
		return r;
	}

	protected stamp(ctx: Context, data: Partial<E>, forCreate?: boolean) {
		if (this.stamped) {
			// Force casting. We can assume this, might have a more elegant way (but should not need StampedDao though)
			const stampedData: StampedEntity = (<any>data) as StampedEntity;
			const now = nowTimestamp();
			if (forCreate) {
				stampedData.cid = ctx.userId;
				stampedData.ctime = now;
			}
			stampedData.mid = ctx.userId;
			stampedData.mtime = now;
		}
	}

	@Monitor()
	async list(ctx: Context, queryOptions?: Q & CustomQuery): Promise<E[]> {
		const k = await getKnex();
		let q = k(this.tableName);
		this.completeQueryBuilder(ctx, q, queryOptions);
		const entities = (await q.then()) as any[]; // TODO: need to check if this is the common way
		return this.processEntities(entities);
	}

	/**
	 * Remove one or more entities from one or more id
	 */
	@Monitor()
	async remove(ctx: Context, ids: I | I[]) {
		const k = await getKnex();

		// if we have a bulk ids, try to do the whereIn (for non-compound for now)
		if (ids instanceof Array) {

			//// if single id properties, we can do whereIn
			if (typeof this.idNames === 'string') {
				return k(this.tableName).delete().whereIn(this.idNames, ids);
			}
			//// if not a compound id, need to do it one by one for now. 
			else {
				let deleteCount = 0;
				for (const id of ids) {
					deleteCount += await k(this.tableName).delete().where(this.getWhereIdObject(id));
				}
				return deleteCount;
			}

		}
		// otherwise, if single id, so ssingle delete
		else {
			return k(this.tableName).delete().where(this.getWhereIdObject(ids));
		}
	}

	protected completeQueryBuilder(ctx: Context, q: QueryBuilder<any, any>, queryOptions?: Q & CustomQuery) {
		// if this dao has a fixed column. 
		if (this.columns) {
			q.columns(this.columns);
		}

		if (queryOptions) {

			if (queryOptions.matching) {
				completeQueryFilter(q, queryOptions.matching)
			}

			if (queryOptions.custom) {
				queryOptions.custom(q);
			}

			if (queryOptions.limit != null) {
				q.limit(queryOptions.limit);
			}

			if (queryOptions.offset != null) {
				q.offset(queryOptions.offset);
			}

			//// add the filters
			if (queryOptions.filters) {
				const filters = queryOptions.filters;
				if (filters instanceof Array) {
					for (const filter of filters) {
						// TOTEST: need to unit test
						q.orWhere(function () {
							completeQueryFilter(q, filter);
						});
					}
				} else {
					completeQueryFilter(q, filters);
				}
			}

			//// add the orderBy
			let orderBy = (queryOptions.orderBy !== undefined) ? queryOptions.orderBy : this.orderBy;
			if (orderBy) {
				let asc = true;
				if (orderBy.startsWith('!')) {
					asc = false;
					orderBy = orderBy.substring(1);
				}
				q = q.orderBy(orderBy, (asc) ? 'ASC' : 'DESC');
			}

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

function completeQueryFilter(q: QueryBuilder<any, any>, filter: Filter) {
	// key can be 'firstName' or 'age;>'
	for (const column in filter) {

		// value to match
		const value = filter[column];
		const opVal = ensureOpVal(value);

		// first handle the new case. 
		if (opVal.val === null) {
			if (opVal.op === '=') {
				q.whereNull(column);
			} else if (opVal.op === '!=') {
				q.whereNotNull(column);
			}
		}
		// handle the case value is define
		else if (value != null) {
			q.andWhere(column, opVal.op, opVal.val);
		}
	}
}


export function ensureOpVal(value: Val | OpVal): OpVal {
	// if val is null, then, the = null
	if (value === null) {
		return { op: '=', val: null };
	}
	// For now check type with the '.op'
	// Note: needs some type hints
	if ((<any>value).op) {
		return value as OpVal;
	} else {
		return { op: '=', val: value as Val };
	}
}