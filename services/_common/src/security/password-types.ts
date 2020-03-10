// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/services/common/src/security/password-types.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

/////////////////////
// Module container the types and base class for pwd encryption
////

export interface PwdEncryptData {
	uuid: string;
	username: string;
	salt: string;
	clearPwd: string;
}

export interface PwdCheckData {
	uuid: string;
	username: string;
	salt: string;
	pwd: string; // encrypted pwd
}

export abstract class PwdScheme {
	abstract encrypt(data: PwdEncryptData): string
}

