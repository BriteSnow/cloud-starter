import produce, { Immutable } from 'immer';



type AnyButArray = object | number | string | boolean;
export function ensureArray<T extends AnyButArray>(a: T | Array<T>): Array<T> {
	return (a instanceof Array) ? a : [a];
}

export async function wait(ms: number) {
	return new Promise(function (resolve) {
		setTimeout(() => { resolve(); }, ms);
	})
}


//#region    ---------- Immutability ---------- 
const noop = (draft: any) => { };
export function freeze<T>(obj: T): Immutable<T> {
	// Note: Since the recipe function is a noop, the obj will be the one freezed
	return produce(obj, noop) as Immutable<T>; // Same as immer castImmutable()
}
//#endregion ---------- /Immutability ----------