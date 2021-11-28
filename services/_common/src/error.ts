// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/services/_common/src/error.ts" />
// (c) 2021 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { symbolDic } from './utils';

export interface ErrRec {
	svrCode: Symbol,
	svrMsg?: string,
	usrCode?: Symbol,
	usrMsg?: string,
}


const ERROR = symbolDic(
	'NO_USER_FOUND'
);

const ERROR2 = errDic(
	['NO_USER_FOUND', ''],
	['WRONG_ID', '']
);

ERROR2;

const ERROR3 = [["NO_USER", 'aaa'], ["NO_WKS", 'bbb']] as const;


const EE = errDic(["NO_USER", 'aaa'] as const, ["NO_WKS", 'bbb'] as const);






export function errDic<T extends readonly (readonly [string, string])[]>(...entries: T) {
	type Names = T[number][0];
	return entries.reduce((o, e) => (o[e[0]] = Symbol(e[0]), o), {} as any) as { [name in Names]: Symbol };
}


export function oldSymbDic<A extends readonly string[]>(...names: A): { [name in A[number]]: Symbol } {
	type Names = A[number];
	type SymbolDic = { [name in Names]: Symbol }
	const result = names.reduce((obj: SymbolDic, v: Names) => (obj[v] = Symbol(v), obj), {} as any);
	return Object.freeze(result);
}


/**
 * Base Error class that should be used in all services code
 */
export class Err extends Error {
	#rec: ErrRec

	constructor(svrCode: Symbol, svr_msg?: string)
	constructor(rec: ErrRec)
	constructor(svrCode_or_rec: Symbol | ErrRec, svr_msg?: string) {
		super();
		let rec: ErrRec;
		if (typeof svrCode_or_rec === 'symbol') {
			rec = { svrCode: svrCode_or_rec };
			if (svr_msg) {
				rec.svrMsg = svr_msg;
			}
		} else {
			// shallow clone
			rec = { ...svrCode_or_rec } as ErrRec; // Note - here needs to help TS
		}
		// just need to capture the string for standard error message
		super(rec.svrCode.toString().slice(7, -1))
		this.#rec = Object.freeze(rec);
	}

	get rec() {
		return this.#rec;
	}
}


