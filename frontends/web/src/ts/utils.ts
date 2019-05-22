import { closest } from "mvdom";


export function guard<U>(val: U | null | undefined, message: string): U {
	if (val == null) {
		throw new Error(message);
	}
	return val;
}

export function asNum(n: string | null): number | null {
	return ((n != null && isNum(n)) ? parseFloat(n) : null);
}

export function isNum(n: any): boolean {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

export function dic(arr: Array<any>, keyName: string) {
	return arr.reduce(function (map, item) {
		var key = item[keyName];
		map[key] = item;
		return map;
	}, {});

	// alternative: var result = new Map(arr.map((i) => [i.key, i.val]));
}


type AnyButArray = object | number | string | boolean;

export function ensureArray<T extends AnyButArray>(a: T | Array<T>): Array<T> {
	return (a instanceof Array) ? a : [a];
}

/**
Look for the closest (up) dom element that have a matching "data-entity" attribute and return 
the reference of the entitye {id, type, el}

- @param el: the element to start the search from (it will be inclusive)
- @param type: (optional) the value of the "data-entity" to be match with. 
							If absent, will return the first element that have a 'data-entity'.

- @return {type, id, el}, where .type will be the 'data-entity', .id the 'data-entity-id' (as number), 
													and .el the dom element that contain those attributes
*/
export function entityRef(el: HTMLElement | EventTarget | null, type?: string) {
	var selector = (type != null) ? ("[data-entity='" + type + "']") : "[data-entity]";

	var entityEl = closest(<HTMLElement>el, selector);
	if (entityEl) {
		var entity: { [name: string]: any } = {};
		entity.el = entityEl;
		entity.type = entityEl.getAttribute("data-entity");
		entity.id = asNum(entityEl.getAttribute("data-entity-id"));
		return entity;
	}
	return null;
}


export function randomString(length?: number) {
	length = length || 6;
	var arr = [];
	var base = Math.pow(10, length);
	for (var i = 0; i < length; i++) {
		arr.push(parseInt((Math.random() * 10).toString()));
	}
	return arr.join("");
}

export function buildTimeVal(time?: number) {
	let timeVal = time ? time : 0;
	let timeStr = "";
	if (timeVal > 60) {
		let mVal = parseInt((timeVal / 60).toFixed(0));
		let sVal = timeVal % 60;
		if (mVal > 60) {
			let hVal = parseInt((mVal / 60).toFixed(0));
			let hmVal = mVal % 60;
			timeStr = hVal + "h" + hmVal + "m";
		} else {
			timeStr = mVal + "m" + sVal + "s";
		}
	} else {
		timeStr = timeVal + "s";
	}
	return timeStr;
}


//#region    ---------- color ---------- 
const lumaCache = new Map<string, number>();
export function getLuma(c: string) {
	if (c.startsWith("#")) {
		c = c.substring(1);
	}

	// try to get it from cach
	let luma = lumaCache.get(c);

	// if not in cache, compute
	if (luma == null) {
		const rgb = parseInt(c, 16);   // convert rrggbb to decimal
		const r = (rgb >> 16) & 0xff;  // extract red
		const g = (rgb >> 8) & 0xff;  // extract green
		const b = (rgb >> 0) & 0xff;  // extract blue

		luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709

		lumaCache.set(c, luma);
	}

	return luma;
}
//#endregion ---------- /color ---------- 


//#region    ---------- attr ---------- 
// conditional typing
//   - if we have no val, then, return void, it's a set val function.
//   - else if v & els is HTMLElement, return single value N is string, otherwise, return array of values if N is string[]
//   - else, v & els is HTMLElement[], and return (string | null)[][] (even if N is string, return array of array avoid user mistakes)
export function attr<E extends HTMLElement, N extends string[] | string, V extends string | null>(els: E, names: N, val?: V):
	V extends void ? void :
	E extends HTMLElement ? N extends string ? (string | null) : (string | null)[] :
	(string | null)[][]; // in this last row E is HTMLElement[] and will alreasy return [elements][attributes]

export function attr(els: HTMLElement | HTMLElement[], names: string[] | string, val?: string | null): (string | null)[][] | (string | null)[] | (string | null) | void {
	// if the el is an array
	if (els instanceof Array) {
		// make sure that names is always array in this case so that we return [][] (to avoid user missstakes)
		names = (names instanceof Array) ? names : [names];
		if (val !== undefined) {
			return els.map((el) => { return _attrEl(el, names, val) as (string | null)[] });
		} else {
			els.forEach((el) => { _attrEl(el, names, val) });
			return;
		}
	} else {
		return _attrEl(els, names, val);
	}

}

// attr on a single element
function _attrEl(el: HTMLElement, names: string[] | string, val?: string | null): (string | null)[] | (string | null) | void {
	if (names instanceof Array) {
		// if we have a val, we set the value
		if (val !== undefined) {
			for (const name of names) {
				_setAttribute(el, name, val);
			}
			return;
		}
		// otherwise, we get the value
		else {
			const result: (string | null)[] = [];
			for (const name of names) {
				result.push(el.getAttribute(name));
			}
			return result;
		}
	}

	// otherwise, single value set
	else {
		if (val !== undefined) {
			_setAttribute(el, names, val);
			return;
		}
		else {
			return el.getAttribute(names);
		}
	}
}

function _setAttribute(el: HTMLElement, name: string, val: string | null) {
	if (val !== null) {
		el.setAttribute(name, val);
	} else {
		el.removeAttribute(name);
	}
}

export function attrAsNum<T extends Element | Element[] | null | undefined>(el: T, name: string, undefinedAsNull?: boolean): T extends Element[] ? number[] : T extends Element[] ? number[] : T extends Element ? (number | null | undefined) : null;
export function attrAsNum<T extends Element | Element[] | null | undefined>(el: T, name: string, undefinedAsNull = false): (number | null | undefined)[] | number | null | undefined {
	if (el == null) {
		return null;
	}
	if (el instanceof Array) {
		const els = el;
		return els.map(el => _attrAsNum(el, name, undefinedAsNull));
	} else {
		return _attrAsNum(el as Element, name, undefinedAsNull);
	}

}

function _attrAsNum(el: Element, name: string, undefinedAsNull: boolean) {
	const nullVal = (undefinedAsNull) ? undefined : null;
	const attr = el.getAttribute(name);
	return (attr) ? Number(attr) : nullVal;

}
//#endregion ---------- /attr ----------