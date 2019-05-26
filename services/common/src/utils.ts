
import { Timer } from 'node-simple-timer';
import * as moment from 'moment';


//#region    ---------- time utils ---------- 
// returns a now formatted for database
export function nowTimestamp() {
	return moment().utc().toISOString();
}

export async function wait(ms: number) {
	return new Promise(function (resolve) {
		setTimeout(() => { resolve(); }, ms);
	})
}

export function timer() {
	return new Timer(true);
}
//#endregion ---------- /time utils ---------- 


//#region    ---------- string utils ---------- 
// cheap random string generator
// TODO: needs to upate this one
export function randomString(length?: number) {
	length = length || 6;
	var arr = [];
	var base = Math.pow(10, length);
	for (var i = 0; i < length; i++) {
		arr.push(parseInt((Math.random() * 10).toString()));
	}
	return arr.join("");
}


export function padZero(num: number, n: number) {
	const numLength = ('' + num).length;
	return Array(n > numLength ? (n - numLength + 1) : 0).join("0") + num.toString();
}

export function formatSize(sizeInBytes: number, formatter?: string) {
	formatter = formatter || "{v}{n}";
	let i = -1;
	const byteUnits = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
	do {
		sizeInBytes = sizeInBytes / 1024;
		i++;
	} while (sizeInBytes > 1024);

	let value = formatter.replace("{v}", Math.max(sizeInBytes, 0.1).toFixed(1));
	value = value.replace("{n}", byteUnits[i]);
	return value;
}
//#endregion ---------- /string utils ----------