// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/services/_common/src/error.ts" />
// (c) 2021 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { symbolDic } from './utils';

export const COMMON_ERROR = symbolDic('INVALID_INPUT', 'APP_ERROR', 'CODE_ERROR');

export interface AppErrRec {
	svrCode: Symbol,
	svrMsg?: string,
	usrCode?: Symbol,
	usrMsg?: string,
}

/**
 * Base Error class that should be used in all services code
 */
export class AppErr extends Error {
	#rec: AppErrRec

	constructor(svrCode: Symbol, svr_msg?: string)
	constructor(rec: AppErrRec)
	constructor(svrCode_or_rec: Symbol | AppErrRec, svr_msg?: string) {
		let rec: AppErrRec;
		if (typeof svrCode_or_rec === 'symbol') {
			rec = { svrCode: svrCode_or_rec };
			if (svr_msg) {
				rec.svrMsg = svr_msg;
			}
		} else {
			// shallow clone
			rec = { ...svrCode_or_rec } as AppErrRec; // Note - here needs to help TS
		}
		// just need to capture the string for standard error message
		super(rec.svrCode.toString().slice(7, -1))
		this.#rec = Object.freeze(rec);
	}

	get rec() {
		return this.#rec;
	}
}


//#region    ---------- Legacy Error ---------- 
export const CommonErrorCode = Object.freeze({
	INVALID_INPUT: 'INVALID_INPUT',
	APP_ERROR: 'APP_ERROR',
	CODE_ERROR: 'CODE_ERROR'
});

export class AppError extends Error {
	code: string;
	constructor(code_or_message: string, message?: string) {
		let code: string;
		if (message) {
			code = code_or_message;
		} else {
			code = CommonErrorCode.APP_ERROR;
			message = code_or_message;
		}
		super(message);
		this.code = code;
	}
}

//#endregion ---------- /Legacy Error ---------- 