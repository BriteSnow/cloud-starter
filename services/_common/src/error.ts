// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/services/_common/src/error.ts" />
// (c) 2021 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

export interface ErrRec {
	svrCode: Symbol,
	svrMsg?: string,
	usrCode?: Symbol,
	usrMsg?: string,
}

/**
 * Base Error class that should be used in all services code
 */
export class Err extends Error {
	#rec: ErrRec

	constructor(svrCode: Symbol, svr_msg?: string)
	constructor(rec: ErrRec)
	constructor(svrCode_or_rec: Symbol | ErrRec, svr_msg?: string) {
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


