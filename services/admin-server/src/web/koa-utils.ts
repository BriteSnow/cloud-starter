import { BaseRouter } from '@backlib/koa';
import { SERVICE_NAME } from 'common/conf';
import { UserContext } from 'common/user-context';
import { Next, ParameterizedContext } from 'koa';
import { ApiResponse } from 'shared/api-types';
import { WebLogRecord } from 'shared/log-types';
import useragent from 'useragent';
import { pruneEmpty } from 'utils-min';

export { routeDelete, routeGet, routePatch, routePost, routeUse } from '@backlib/koa';

export function success<T = any>(data?: T): ApiResponse<T> {
	return { success: true, data };
}

//#region    ---------- Base App Router ---------- 
export interface KState {
	utx?: UserContext, // will be defined in APIKState, but allow to avoid casting
	webLogState: {
		ip: string,
		startTime: number,
		info?: any
	}
}

export interface KCustom {
	clearCookie(name: string): void
	/**
	 * Add some properties to the log.info object. 
	 * 
	 * IMPORTANT: By design (to keep things simple) this is just doing a Object.assign(info, props), and not a deep merge
	 * 
	 * @param props the properties to be set of the current webLog info object.
	 */
	addWebLogInfo(props: any): void
}

export interface Ktx extends ParameterizedContext<KState, KCustom> { }


/** First middleware to be called to init */
export function initKtx(koaCtx: ParameterizedContext, next: Next) {
	//// upgrade the koaCtx to Ktx
	koaCtx.clearCookie = function (name: string) {
		koaCtx.cookies.set(name, '', { expires: new Date(2000, 1) });
	}
	koaCtx.addWebLogInfo = function (props: any) {
		if (koaCtx.state.webLogState.info == null) {
			koaCtx.state.webLogState.info = {};
		}
		// NOTE: Important, where we do a shallow assign, not a deep merge. 
		Object.assign(koaCtx.state.webLogState.info, props);
	}

	//// Upgrade the State to KState
	const ip = (koaCtx.ips && koaCtx.ips.length > 0) ? koaCtx.ips.join(',') : koaCtx.ip;
	const webLogState: KState['webLogState'] = {
		ip,
		startTime: Date.now()
	};
	(<KState>koaCtx.state) = Object.assign(koaCtx.state ?? {}, { webLogState });

	return next();
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


//#region    ---------- WebLog ---------- 
export function buildWebLogRecord(ktx: ParameterizedContext<KState & Partial<ApiKState>>, err?: { err_code?: string, err_msg?: string }): Omit<WebLogRecord, 'khost' | 'timestamp'> {
	// build the WebLogRecord
	const { startTime, ip: _ip, info } = ktx.state.webLogState;
	const err_code = err?.err_code;
	const err_msg = err?.err_msg;
	const duration = Date.now() - startTime;

	const agent = useragent.parse(ktx.headers['user-agent'] as string);
	const os = agent.os;
	const device = agent.device.family;
	const ips = _ip.replace('::ffff:', '');
	const ip = ips.includes(',') ? ips.split(',')[0] : ips;
	const br_name = agent.family;
	const br_version = pruneEmpty([agent.major, agent.minor, agent.patch]).join('-');
	const os_name = os.family;
	const os_version = pruneEmpty([os.major, os.minor, os.patch]).join('-');

	const rec: Omit<WebLogRecord, 'khost' | 'timestamp'> = {
		service: SERVICE_NAME,
		success: (ktx.status === 200),
		ip,
		ips,
		http_method: ktx.method,
		http_status: ktx.status,
		path: ktx.path,
		duration,
		device,
		br_name,
		br_version,
		os_name,
		os_version,
		err_code,
		err_msg,
		info
	};

	if (ktx.state.utx != null) {
		if (ktx.state.utx.userId != null) {
			rec.userId = ktx.state.utx.userId;
		}
		// if (ktx.state.utx.orgId != null) {
		// 	rec.orgId = ktx.state.utx.orgId;
		// }
	}

	return rec;
}
//#endregion ---------- /WebLog ----------

