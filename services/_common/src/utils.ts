
export * from './utils-cloud-starter';
export { asNum } from './utils-mvdom-xp';


//////////
// Application specific utils
/////////


//#region    ---------- Object ---------- 
/** Remove the properties from an object  */
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
