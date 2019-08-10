// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/services/common/src/error.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

export const CommonErrorCode = Object.freeze({
	INVALID_INPUT: 'INVALID_INPUT'
});

export class AppError extends Error {
	code: string;
	constructor(code: string, message?: string) {
		const msg = message || code; // if only one arg, then, it's the message
		super(msg);
		this.code = code;
	}
}