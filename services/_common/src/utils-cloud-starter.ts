// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/services/common/src/utils-cloud-starter.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import moment from 'moment';

//#region    ---------- time utils ---------- 
// returns a now formatted for database
export function nowTimestamp() {
	return moment().utc().toISOString();
}
//#endregion ---------- /time utils ---------- 


//#region    ---------- string utils ---------- 
// NOTE: This is ok for display formatting, but should not not / 1024 for storage (lose precision and get too many decimals)
export function formatSize(sizeInBytes: number, formatter?: string): string {
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