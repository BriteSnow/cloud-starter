
export const CommonErrorCode = Object.freeze({
	INVALID_INPUT: 'INVALID_INPUT'
});

export class AppError extends Error {
	code: string;
	constructor(code: string, message?: string) {
		const msg = message || code;
		super(msg);
		this.code = code;
	}
}