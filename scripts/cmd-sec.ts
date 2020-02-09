import baseX from 'base-x';
import crypto from 'crypto';
import uuidV4 from 'uuid/v4';

const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const base62 = baseX(BASE62);
const SALT_LENGTH = 18;

main();

interface UserSec {
	username: string;
	salt: string;
	pwd: string;
	uuid: string;
}

interface UserEncryptStruct {
	uuid: string;
	username: string;
	totalSalt: string;
	clearPwd: string;
}

async function main() {
	const username = 'joe';
	const clearPwd = 'welcome';
	const globalSalt = createSalt();


	let userSec: UserSec;

	console.time('start');
	for (let i = 0; i < 1000; i++) {
		userSec = createUser(username, clearPwd, globalSalt);
	}
	console.timeEnd('start');
	console.log(`Done`, userSec!);

}


function createUser(username: string, clearPwd: string, globalSalt: string): UserSec {
	const uuid = uuidV4();
	const localSalt = createSalt();
	const toEncrypt: UserEncryptStruct = {
		uuid,
		username,
		clearPwd,
		totalSalt: globalSalt + localSalt,
	}

	const pwd = pwdEncrypt(toEncrypt);
	return {
		username,
		uuid,
		pwd,
		salt: localSalt
	}
}


function pwdEncrypt(data: UserEncryptStruct) {
	const hash = crypto.createHmac('sha256', data.totalSalt); /** Hashing algorithm sha512 */
	hash.update(data.uuid + data.clearPwd);
	const value = hash.digest('base64');
	return value;
}

function createSalt() {
	const buf = crypto.randomBytes(SALT_LENGTH);
	return buf.toString('hex');
}