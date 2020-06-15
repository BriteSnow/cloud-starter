import { UserContext } from 'common/user-context';
import { nowTimestamp } from 'common/utils';
import { Next, ParameterizedContext } from 'koa';
import { Timer } from 'node-simple-timer';
import { ApiResponse } from 'shared/api-types';
import { BaseRouter } from './koa-base-router';

export { routeDelete, routeGet, routePatch, routePost, routeUse } from './koa-base-router';

export function success<T = any>(data?: T): ApiResponse<T> {
	return { success: true, data };
}

//#region    ---------- Base App Router ---------- 
export interface KState {
	utx?: UserContext, // will be defined in APIKState, but allow to avoid casting
	webLogInfo: {
		ip: string,
		timestamp: string,
		timer: Timer
	}
}

export interface KCustom {
	clearCookie(name: string): void
}

export interface Ktx extends ParameterizedContext<KState, KCustom> { }


/** First middleware to be called to init */
export function initKtx(koaCtx: ParameterizedContext, next: Next) {
	//// upgrade the koaCtx to Ktx
	koaCtx.clearCookie = function (name: string) {
		koaCtx.cookies.set(name, '', { expires: new Date(2000, 1) });
	}

	//// Upgrade the State to KtxState
	const ip = (koaCtx.ips && koaCtx.ips.length > 0) ? koaCtx.ips.join(',') : koaCtx.ip;
	const webLogInfo = {
		ip,
		timestamp: nowTimestamp(),
		timer: new Timer(true)
	}
	if (koaCtx.state == null) {
		koaCtx.state = {};
	}
	koaCtx.state.webLogInfo = webLogInfo;

	return next();
	// Note: the KState.context is still missing, since we are doing this the auth layer
	//       Perhaps needs to have an empty/not-auth-yet Context, which will allow to be type strict from here.
}

/**
 * Base App router that any application router should extends of. 
 */
export class AppRouter<S = KState, C = KCustom> extends BaseRouter<S, C>{
	async assertKtx(ktx: ParameterizedContext<S, C>) {
		if (ktx.state == null) {
			throw new Error(`ERROR - BaseRouter assertKtx error - ktx does not have a '.state' property (make sure to initiliaze)`)
		}
	}
}
//#endregion ---------- /Base App Router ---------- 

//#region    ---------- Base API Router ---------- 
export interface ApiKCustom extends KCustom {
	params: any; // for koa-router
}

export interface ApiKState extends KState {
	utx: UserContext
}

export interface ApiKtx extends ParameterizedContext<ApiKState, ApiKCustom> { }

export function assertApiKtx(obj: Ktx & any): asserts obj is ApiKtx {
	if (obj.state.utx == null) {
		throw new Error('ERROR - ktx is not compatible with ApikKtx')
	}
}

/**
 * Base router class for any API that requires authentication and have a ktx.state.utx. 
 */
export class ApiRouter extends AppRouter<ApiKState, ApiKCustom>{
	async assertKtx(ktx: ParameterizedContext<ApiKState, ApiKCustom>) {
		super.assertKtx(ktx);
		if (ktx.state == null) {
			throw new Error(`ERROR - BaseRouter assertKtx error - ktx does not have a '.state' property (make sure to initiliaze)`)
		}
	}
}
//#endregion ---------- /Base API Router ----------







