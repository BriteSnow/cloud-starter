// require('../../_common/src/setup-module-aliases');

import { router } from 'cmdrouter';
import { userDao } from 'common/da/daos.js';
import { closeKnexClient } from 'common/da/db.js';
import { PwdEncryptData } from 'common/security/password-types.js';
import { pwdCheck, pwdEncrypt } from 'common/security/password.js';
import { getSysContext } from 'common/user-context.js';
import { v4 as uuidV4 } from 'uuid';


router({ _default, makeCredential, createUser, setPwd }).route();

function _default() {
	console.log(`New uuidv4: ${uuidV4()}`);
}

async function makeCredential(username?: string, clearPwd?: string) {

	// if both are not defined, then, just show salt
	if (!username || !clearPwd) {
		console.log('CANNOT EXEC - Not enough arguments to makeCredential. Needs username and clearPwd');
		return;
	}

	// create a new credential
	const cred = newUserCredential(username, clearPwd);
	console.log(`New Credential for ${username} / ${clearPwd} :`);
	console.log(cred);

	// check the credential
	console.log(`\nCheck credential:`);
	const check = pwdCheck(clearPwd, cred);
	console.log(check);
	console.log();

}

async function createUser(username: string, clearPwd: string) {
	// if both are not defined, then, just show salt
	if (!username || !clearPwd) {
		console.log('CANNOT EXEC - Not enough arguments to makeCredential. Needs username and clearPwd');
		return;
	}
	const sysUtx = await getSysContext();
	await userDao.createUser(sysUtx, { username, clearPwd });
	await closeKnexClient();
}

async function setPwd(username: string, clearPwd: string) {
	const sysUtx = await getSysContext();
	await userDao.setPwd(sysUtx, { username }, clearPwd);
	await closeKnexClient();
}



interface UserCredential {
	uuid: string,
	username: string,
	pwd: string,
	psalt: string,
}

/**
 * Create a new uuid, salt, and pwd given a username and clearPwd without creating it in the db. 
 */
export function newUserCredential(username: string, clearPwd: string): UserCredential {
	const uuid = uuidV4();
	const psalt = uuidV4();
	const toEncrypt: PwdEncryptData = {
		uuid,
		clearPwd,
		psalt,
	}

	const pwd = pwdEncrypt(toEncrypt);

	return {
		username,
		uuid,
		pwd,
		psalt
	}
}