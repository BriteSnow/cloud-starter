
export { asNum } from 'utils-min';
export * from './utils-cloud-starter';


//////////
// Application specific utils
/////////


//#region    ---------- Object ---------- 
/** Remove the properties from an object
 * TODO: to deprecate. Use utils-min, omit(obj, ...prop), or implement omitIn if need in place
 */
export function removeProps(obj: any, names: string[]) {
	for (const name of names) {
		if (name in obj) {
			delete obj[name];
		}
	}
}
//#endregion ---------- /Object ---------- 

//#region    ---------- base64 encoding ---------- 
export function b64dec(str_b64: string) {
	return Buffer.from(str_b64, 'base64').toString('ascii');
}

export function b64enc(str: string) {
	return Buffer.from(str).toString('base64');
}
//#endregion ---------- /base64 encoding ----------


/** 
 * Convert the first level properties to num or bool if property name match the opts.nums or opts.bools 
 * 
 * TODO: try to type more this method, so far any in, any out.
 **/
export function typify(obj: any, opts: { nums?: string[], bools?: string[] }): any {
	const newObj: any = {};
	const numSet = new Set(opts.nums);
	const boolSet = new Set(opts.bools);
	for (const k in obj) {
		const val = obj[k];
		if (val != null && typeof val === 'string') {
			if (numSet.has(k)) {
				newObj[k] = Number(val); // TODO: handle when fail or isNaN
			} else if (boolSet.has(k)) {
				newObj[k] = (val === 'true') ? true : false;
			} else {
				newObj[k] = val;
			}
		} else {
			newObj[k] = val;
		}
	}
	return newObj;
}