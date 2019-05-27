// <origin src="https://raw.githubusercontent.com/mvdom/mvdom-xp/master/src/utils.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

type NumType = number | null;
type StringType = (string | null | undefined)

/**
 * Numberize a single, array, or array of array of string/null/undefined. items are (number | null). 'null' is set when NaN. 
 * @param vals scalar value, array, or array of array of (string | null)
 */
export function asNum<V extends StringType[][] | StringType[] | StringType>(vals: V):
	V extends string | null | undefined ? null :
	V extends string[] ? NumType[] : NumType[][];

export function asNum(vals: StringType[][] | StringType[] | StringType): NumType[][] | NumType[] | NumType {

	// take the string value of val if exist (preserve null or undefined)

	// first if null, return as is
	if (vals == null) {
		return null;
	}

	// if it is a string, return the parsed string (return null | number)
	if (typeof vals === 'string') {
		return _asNum(vals)
	}

	// at this point vals is an array or array of array

	// if empty array return empty array
	if (vals.length === 0) {
		return []; // return empty array
	}

	// determine if we have array or array of array base on arguments. 
	// Assume that types were respected, and that first element of the array is representative of the sequence.
	const is2d = (vals[0] instanceof Array);

	// Note: here ts needs little help.
	return (is2d) ? (<string[][]>vals).map(items => { return items.map(_asNum) }) : (<string[]>vals).map(_asNum);
}

// returns a number or null (if input is null/undefined or parse to a NaN)
function _asNum(str: string | null | undefined): number | null {
	if (str == null) {
		return null;
	}
	const num = Number(str);
	return isNaN(num) ? null : num; // return null if NaN per function contract
}
//#endregion ---------- /attrAsNum ----------