

type AnyButArray = object | number | string | boolean;
export function ensureArray<T extends AnyButArray>(a: T | Array<T>): Array<T> {
	return (a instanceof Array) ? a : [a];
}

export async function wait(ms: number) {
	return new Promise(function (resolve) {
		setTimeout(() => { resolve(); }, ms);
	})
}
