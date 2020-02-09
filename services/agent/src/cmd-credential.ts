require('../../_common/src/setup-module-aliases');

import { newUserCredential } from 'common/da/dao-user';
import { createSalt } from 'common/security/generators';
import { pwdCheck } from 'common/security/password';

main();

async function main() {
	const [username, clearPwd] = process.argv.slice(2);

	// if both are not defined, then, just show salt
	if (!username && !clearPwd) {
		console.log(`New SALT: ${createSalt()}`);
		return;
	}

	// otherwise much have both
	if (process.argv.length < 4) {
		console.log(`ERROR - Must have 'npm run credential _username_ _clearPassword_' to generate a user credential`);
		return
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
