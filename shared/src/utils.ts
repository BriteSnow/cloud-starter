

type AnyButArray = object | number | string | boolean;
export function ensureArray<T extends AnyButArray>(a: T | Array<T>): Array<T> {
	return (a instanceof Array) ? a : [a];
}

export function asNum(str: string | null | undefined): number | null {
	if (str == null) {
		return null;
	}
	const num = Number(str);
	return isNaN(num) ? null : num; // return null if NaN per function contract
}