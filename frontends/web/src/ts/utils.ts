import { closest } from "mvdom";
import { attrAsNum } from "mvdom-xp";


export function guard<U>(val: U | null | undefined, message: string): U {
	if (val == null) {
		throw new Error(message);
	}
	return val;
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
		entity.id = attrAsNum(entityEl, 'data-entity-id');
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