// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/services/common/src/utils-cloud-starter.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import moment from 'moment';
import { Timer as _Timer } from 'node-simple-timer';

//#region    ---------- time utils ---------- 
// returns a now formatted for database
export function nowTimestamp() {
	return moment().utc().toISOString();
}

export function timer() {
	return new Timer();
}

class Timer extends _Timer {
	constructor() {
		super(true);
	}
	ms() {
		return Math.round(this.milliseconds());
	}
}
//#endregion ---------- /time utils ---------- 


//#region    ---------- string utils ---------- 
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