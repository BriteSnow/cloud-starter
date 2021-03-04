// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/services/_common/src/request-wrapper-mdw.ts" />
// (c) 2021 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { PERF_LOG_THRESHOLD_WEB } from '../conf';
import { Err, ErrRec } from '../error';
import { web_log } from '../log/logger';
import { symbolDic, symToStr } from '../utils';
import { AuthFailErr, clearAuth } from './auth';
import { buildWebLogRecord, Ktx, Next } from './koa-utils';

const ERROR = symbolDic(
	'SVR_ERROR'// GENERIC SERVER ERROR, not from AppERR
)

const USR_ERROR = symbolDic(
	'ERROR'// GENERIC SERVER ERROR, not from AppERR
)

/**
 * Koa Middleware wrapping the intialized and potentially authenticated request for web logging and 
 * common error handling.
 * 
 * Koa error handling: https://github.com/koajs/koa/wiki/Error-Handling
 */
export async function handleRequestWrapperMdw(ktx: Ktx, next: Next) {
	try {
		await next();
		const rec = buildWebLogRecord(ktx);
		await web_log(rec);

		// Additional console.log on threshold
		if (rec.duration >= PERF_LOG_THRESHOLD_WEB) {
			console.log(`WARNING - PERF ${rec.duration}ms > ${PERF_LOG_THRESHOLD_WEB}ms - ${ktx.path}\n` + JSON.stringify(ktx.state.utx?.perfContext.items, null, '  ') + '\n');
		}

	} catch (ex) {
		let errRec: ErrRec;

		//// extract/build the errRec
		if (ex instanceof Err) {
			errRec = ex.rec;
		} else if (ex instanceof Error) {
			errRec = {
				svrCode: ERROR.SVR_ERROR,
				svrMsg: ex.message
			}
		} else if (typeof ex == 'string') {
			errRec = {
				svrCode: ERROR.SVR_ERROR,
				svrMsg: ex
			}
		} else {
			errRec = {
				svrCode: ERROR.SVR_ERROR,
				svrMsg: '' + ex
			}
		}

		//// If AuthFail reset cookies
		if (ex instanceof AuthFailErr) {
			clearAuth(ktx);
		}

		//// Send only user code/message to client
		ktx.status = 500;
		const error: { code: string, message?: string } = {
			code: errRec.usrCode ? symToStr(errRec.usrCode) : symToStr(USR_ERROR.ERROR),
		}
		if (errRec.usrMsg) {
			error.message = errRec.usrMsg
		}
		ktx.body = { error };

		//// Log all rec info to server
		let errTxt = `WEB REQUEST ERROR - SVR_CODE: ${symToStr(errRec.svrCode)}`;
		if (errRec.svrMsg) {
			errTxt += `\n\t svrMsg: ${errRec.svrMsg}`
		}
		if (errRec.usrCode) {
			errTxt += `\n\t usrCode: ${symToStr(errRec.usrCode)}`
		}
		if (errRec.usrMsg) {
			errTxt += `\n\t usrMsg: ${errRec.usrMsg}`
		}
		console.log(errTxt);
	}
}