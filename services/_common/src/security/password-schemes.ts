// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/services/_common/src/security/generator-schemes.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

/////////////////////
// Module containing the various pwd schemes. 
// Note: Usually will need to be detached with some app specific constant import
////

import crypto from 'crypto';
import { PWD_SCHEME_01_SALT, PWD_SCHEME_02_SALT } from '../conf';
import { PwdEncryptData, PwdScheme } from './password-types';


//#region    ---------- Scheme Basic ---------- 
class SchemeBasic extends PwdScheme {
	GLOBAL_SALT = PWD_SCHEME_01_SALT;

	encrypt(data: PwdEncryptData) {
		// for this example, we will use sha256, but can be made more secure if see, SchemeStronger.
		return crypto.createHash("sha256").update(this.GLOBAL_SALT + data.clearPwd).digest("hex");
	}
}
//#endregion ---------- /Scheme Basic ----------


//#region    ---------- Scheme Stronger ---------- 
class SchemeStronger extends PwdScheme {
	GLOBAL_SALT = PWD_SCHEME_02_SALT;

	encrypt(data: PwdEncryptData) {
		const hash = crypto.createHmac('sha512', this.GLOBAL_SALT + data.psalt);
		hash.update(data.uuid + data.clearPwd);
		const encPwd = hash.digest('base64');
		return encPwd;
	}
}
//#endregion ---------- /Scheme Stronger ----------


export const schemes = {
	'01': new SchemeBasic(),
	'02': new SchemeStronger()
}