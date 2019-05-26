// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/services/commmon/src/da/dao-base.ts" />

import { QueryBuilder } from 'knex';
import { QueryOptions, StampedEntity } from 'shared/entities';
import { Context } from '../context';
import { Monitor } from '../perf';
import { nowTimestamp } from '../utils';
import { getKnex } from './db';

interface CustomQuery {
	custom?: (q: QueryBuilder<any, any>) => void;
}

// Note: for now, the knex can take a generic I for where value
// @annoC
export class BaseDao<E, I, Q extends QueryOptions<E> = QueryOptions<E>> {
	readonly tableName: string;
	readonly idNames: string | string[];
	readonly stamped: boolean;
	readonly defaultOrderBy: string | null;

	constructor(tableName: string, stamped: boolean, idNames: string | string[] = 'id', defaultOrderBy: string | null = '!id') {
		this.tableName = tableName;
		this.idNames = idNames;
		this.stamped = stamped;
		this.defaultOrderBy = defaultOrderBy;
	}

	/**
	 * Convenient methods to process a list of object to this entity. 
	 * 
	 * MUST NOT BE OVERRIDEN, override processEntity instead
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
		const r = await k(this.tableName).where(data).limit(1);
		// TODO: probably need to limit 1
		// TODO: should probably use the defaultOrderBy
		if (r.length === 0) {
			return null;
		}
		return this.processEntity(r[0]);
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
		this.completeQueryBuildWithQueryOptions(ctx, q, queryOptions);
		const entities = (await q.then()) as any[]; // TODO: need to check if this is the common way
		return this.processEntities(entities);
	}

	@Monitor()
	async remove(ctx: Context, id: I) {
		const k = await getKnex();
		return k(this.tableName).delete().where(this.getWhereIdObject(id));
	}

	protected completeQueryBuildWithQueryOptions(ctx: Context, q: QueryBuilder<any, any>, queryOptions?: Q & CustomQuery) {
		if (queryOptions) {
			if (queryOptions.matching) {
				q = q.where(queryOptions.matching);
			}

			if (queryOptions.custom) {
				queryOptions.custom(q);
			}

			let orderBy = (queryOptions.orderBy !== undefined) ? queryOptions.orderBy : this.defaultOrderBy;

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