// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/services/common/src/error.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

export const CommonErrorCode = Object.freeze({
	INVALID_INPUT: 'INVALID_INPUT',
	APP_ERROR: 'APP_ERROR'
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