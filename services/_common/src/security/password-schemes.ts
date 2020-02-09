//// NOTE: This is the password-schemes model. 


import crypto from 'crypto';
import { PwdEncryptData, PwdScheme } from './password-types';

//#region    ---------- Scheme Clear ---------- 
class SchemeClear extends PwdScheme {
	encrypt(data: PwdEncryptData) {
		console.log('WARNING - Clear PWD was check for user ${data.uuid} - Will be encrypted at first login');
		return data.clearPwd;
	}
}
//#endregion ---------- /Scheme Clear ----------


//#region    ---------- Scheme Basic ---------- 
class SchemeBasic extends PwdScheme {
	GLOBAL_SALT = '74fec92e9686264e3637189168eb3c50ffaa';

	encrypt(data: PwdEncryptData) {
		// for this example, we will use sha256, but can be made more secure if see, SchemeStronger.
		return crypto.createHash("sha256").update(this.GLOBAL_SALT + data.clearPwd).digest("hex");
	}

}
//#endregion ---------- /Scheme Basic ----------


//#region    ---------- Scheme Stronger ---------- 
class SchemeStronger extends PwdScheme {
	GLOBAL_SALT = '74fec92e9686264e3637189168eb3c50ffaa';

	encrypt(data: PwdEncryptData) {
		const hash = crypto.createHmac('sha512', this.GLOBAL_SALT + data.salt);
		hash.update(data.uuid + data.clearPwd);
		return hash.digest('base64');
	}

}
//#endregion ---------- /Scheme Stronger ----------


export const schemes = {
	'00': new SchemeClear(),
	'01': new SchemeBasic(),
	'02': new SchemeStronger()
}