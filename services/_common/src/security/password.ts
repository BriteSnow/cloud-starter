// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-bigapp/master/services/common/src/security/password.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

/////////////////////
// Password encryption module. 
// Note: This is a good idea to have it attached as it is more of a boilerplate code.
////

import { AppError } from '../error';
import { schemes } from './password-schemes';
import { PwdCheckData, PwdEncryptData } from './password-types';

const ERROR_PWD_CHECK_FAIL = 'PWD_CHECK_FAIL';

type SchemeId = keyof typeof schemes;

//#region    ---------- public function ---------- 
const defaultSchemeId: SchemeId = '02';

export function pwdEncrypt(data: PwdEncryptData) {
	const schemeId = defaultSchemeId;
	const scheme = schemes[defaultSchemeId];
	const hash = scheme.encrypt(data);
	return `#E${schemeId}#${hash}`;
}

export function pwdCheck(clearPwd: string, data: PwdCheckData): { scheme_outdated: boolean } {
	const { schemeId, pwd } = extractSchemeId(data.pwd);
	const scheme = schemes[schemeId];
	const { uuid, psalt } = data;
	const clearPwdEncrypted = scheme.encrypt({ uuid, psalt, clearPwd });
	// build the response
	if (pwd !== clearPwdEncrypted) {
		throw new AppError(ERROR_PWD_CHECK_FAIL, `Authentication Fail`); // IMPORTANT: Never put either password in ANY log
	}
	const scheme_outdated = schemeId !== defaultSchemeId;
	return { scheme_outdated };
}
//#endregion ---------- /public function ----------


function extractSchemeId(pwd: string): { schemeId: SchemeId, pwd: string } {
	const m = /^#E(\d+)#(.*)/.exec(pwd);
	let schemeId: SchemeId; // if clear
	if (m) {
		schemeId = m[1] as SchemeId;
		if (!Object.keys(schemes).includes(schemeId)) {
			throw new Error(`Scheme id ${schemeId} not recognized`);
		}
		pwd = m[2];
	} else {
		throw new Error(`No Scheme id in pwd`);
	}

	return { schemeId, pwd };
}