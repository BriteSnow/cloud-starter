
import Router from '@koa/router';
import { Middleware, Next, ParameterizedContext } from 'koa';
import koaCompose from 'koa-compose';

const REQUEST_METHODS = Object.freeze(['get', 'post', 'put', 'patch', 'options', 'delete', 'head'] as const);
type RequestMethod = typeof REQUEST_METHODS[number];

type RouteItem<S, C> = { requestMethod: RequestMethod, handler: RequestHandler<S, C>, path: string };

export type RequestHandler<S, C> = (ktx: ParameterizedContext<S, C>) => Promise<any>;

type ToRegister<S, C> = {
	useItems: Middleware[]
	routeItems: RouteItem<S, C>[]
}

export class BaseRouter<S, C> {
	readonly __toRegister!: ToRegister<S, C>;

	private readonly koaRouterWrapper: KoaRouterWrapper<S, C>;

	private readonly _middleware: Middleware<any, any>; // keep type flexible here

	/** Return the composed middleware of all of the route of this router */
	middleware() { return this._middleware }

	constructor(prefix?: string) {
		this.koaRouterWrapper = new KoaRouterWrapper(prefix);

		//// wrap the use item
		const wrappedUseMiddelwares = this.__toRegister.useItems.map(useItem => this.wrapUseMiddleware(useItem));

		//// register the routeItems to the this.koaRouterWrapper
		for (const item of this.__toRegister.routeItems) {
			if (item.path == null) {
				console.log(`CODE ERROR - @${item.requestMethod} must have a path in ${this.constructor.name}.`);
				continue;
			}
			const wrappedRequestHandler = this.wrapRequestHandler(item.handler);
			this.koaRouterWrapper.registerRoute(item.requestMethod, item.path, wrappedRequestHandler);
		}

		//// create new composed middleware (use items first, then the routes)
		this._middleware = koaCompose([...wrappedUseMiddelwares, this.koaRouterWrapper.routes()]);
	}

	async assertKtx(ktx: ParameterizedContext<S, C>) {
		// by default does not do any check. Sub classes should do the ktx check. 
	}

	protected wrapUseMiddleware(useMiddleware: Middleware<S, C>): Middleware<S, C> {
		const fn = async (ktx: ParameterizedContext<S, C>, next: Next) => {

			try {
				await this.assertKtx(ktx);

				// call it as is (no .call or .apply, to follow previous binding for this)
				return useMiddleware.call(this, ktx, next);

			} catch (ex) {
				throw ex;
			}
		}

		Object.defineProperty(fn, 'name', { value: `wrapped_${useMiddleware.name}`, writable: false });
		return fn;
	}
	protected wrapRequestHandler(requestHandler: RequestHandler<S, C>): Middleware<S, C> {

		const fn = async (ktx: ParameterizedContext<S, C>) => {

			try {
				await this.assertKtx(ktx);

				// call it as is (no .call or .apply, to follow previous binding for this)
				const r = await requestHandler.call(this, ktx);

				// if we have a return value, we assume it needs to be streamed back
				if (r != null) {

					// if we have a string
					if (typeof r === 'string') {
						throw new Error(`API RequestHandler cannot return string object, must return object ${ktx.path}`);
					}

					ktx.body = r;
				}
			} catch (ex) {
				throw ex;
			}
		}

		Object.defineProperty(fn, 'name', { value: `wrapped_${requestHandler.name}`, writable: false });
		return fn;
	}


}

interface BaseRouterPrototype {
	__toRegister: ToRegister<any, any>;
}

//#region    ---------- Route Decorators ---------- 
export function routeUse() {
	return function (target: BaseRouterPrototype, propertyKey: string, descriptor: PropertyDescriptor) {
		addUseItem(target, descriptor.value);
	}
}
export function routeGet(path: string) {
	return function (target: BaseRouterPrototype, propertyKey: string, descriptor: PropertyDescriptor) {
		addRouteItem(target, propertyKey, descriptor, 'get', path);
	}
}
export function routePost(path: string) {
	return function (target: BaseRouterPrototype, propertyKey: string, descriptor: PropertyDescriptor) {
		addRouteItem(target, propertyKey, descriptor, 'post', path);
	}
}
export function routePut(path: string) {
	return function (target: BaseRouterPrototype, propertyKey: string, descriptor: PropertyDescriptor) {
		addRouteItem(target, propertyKey, descriptor, 'put', path);
	}
}
export function routePatch(path: string) {
	return function (target: BaseRouterPrototype, propertyKey: string, descriptor: PropertyDescriptor) {
		addRouteItem(target, propertyKey, descriptor, 'patch', path);
	}
}
export function routeOptions(path: string) {
	return function (target: BaseRouterPrototype, propertyKey: string, descriptor: PropertyDescriptor) {
		addRouteItem(target, propertyKey, descriptor, 'options', path);
	}
}
export function routeDelete(path: string) {
	return function (target: BaseRouterPrototype, propertyKey: string, descriptor: PropertyDescriptor) {
		addRouteItem(target, propertyKey, descriptor, 'delete', path);
	}
}
export function routeHead(path: string) {
	return function (target: BaseRouterPrototype, propertyKey: string, descriptor: PropertyDescriptor) {
		addRouteItem(target, propertyKey, descriptor, 'head', path);
	}
}

function addUseItem(target: BaseRouterPrototype, handler: Middleware) {
	const toRegister = getToRegister(target);
	toRegister.useItems.push(handler);
}

function addRouteItem(target: BaseRouterPrototype, propertyKey: string, descriptor: PropertyDescriptor, requestMethod: RequestMethod, path: string) {
	const toRegister = getToRegister(target);
	toRegister.routeItems.push({ requestMethod, handler: descriptor.value, path })
}

function getToRegister(target: BaseRouterPrototype) {
	if (target.__toRegister == null) {
		target.__toRegister = { useItems: [], routeItems: [] };
	}
	return target.__toRegister;
}

//#endregion ---------- /Route Decorators ---------- 



class KoaRouterWrapper<S, C> {
	private readonly koaRouter: Router<S, C>;

	constructor(prefix?: string) {
		this.koaRouter = new Router({ prefix });
	}

	routes() {
		return this.koaRouter.routes();
	}

	registerRoute(method: RequestMethod, path: string, wrappeHandler: Middleware<S, C>) {
		// TODO: make sure method match the requestMethod
		this.koaRouter.register(path, [method], wrappeHandler);
	}
}

