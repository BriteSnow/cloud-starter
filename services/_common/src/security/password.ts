// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/services/common/src/security/password.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)


import { schemes } from './password-schemes';
import { PwdCheckData, PwdEncryptData } from './password-types';


type SchemeId = keyof typeof schemes;

//#region    ---------- public function ---------- 
const defaultSchemeId: SchemeId = '02';

export function pwdEncrypt(data: PwdEncryptData) {
	const schemeId = defaultSchemeId;
	const scheme = schemes[defaultSchemeId];
	const hash = scheme.encrypt(data);
	return `#E${schemeId}#${hash}`;
}

export function pwdCheck(clearPwd: string, data: PwdCheckData): { pass: boolean, scheme_outdated: boolean } {
	const { schemeId, pwd } = extractSchemeId(data.pwd);
	const scheme = schemes[schemeId];
	const { uuid, username, salt } = data;
	const clearPwdEncrypted = scheme.encrypt({ uuid, username, salt, clearPwd });

	// build the response
	const pass = pwd === clearPwdEncrypted;
	const scheme_outdated = schemeId !== defaultSchemeId;
	return { pass, scheme_outdated };
}

//#endregion ---------- /public function ----------


function extractSchemeId(pwd: string): { schemeId: SchemeId, pwd: string } {
	const m = /^#E(\d+)#(.*)/.exec(pwd);
	let schemeId: SchemeId = '00'; // if clear
	if (m) {
		schemeId = m[1] as SchemeId;
		if (!Object.keys(schemes).includes(schemeId)) {
			throw new Error(`Scheme id ${schemeId} not recognized`);
		}
		pwd = m[2];
	}

	return { schemeId, pwd };
}