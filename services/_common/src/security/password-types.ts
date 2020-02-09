// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/services/common/src/security/password-types.ts" />

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
	pwd: string;
}

export abstract class PwdScheme {
	abstract encrypt(data: PwdEncryptData): string
}

