
import * as crypto from 'crypto';

const SALT = "qRkVBkLwJWy2fAmXNCVDDJxxR3tuNMJiKXvcTGJQGeszN";

export function encryptPwd(pwd: string) {
	const schemeName = "01";
	// for this example, we will use sha256, but can be made much more secure if needed.
	const encryptedPwd = crypto.createHash("sha1").update(SALT + pwd).digest("hex");
	return `#E${schemeName}#${encryptedPwd}`;
}

export function checkPwd(clearPwd?: string, referencePwd?: string) {
	if (!referencePwd || !clearPwd) {
		return false;
	}
	// the pwdToCompare is the encrypted pwd given the referencePwd scheme (which could be the clearScheme or another)
	let pwdToCompare = clearPwd;
	if (!isEncrypted(clearPwd) && isEncrypted(referencePwd)) {
		pwdToCompare = encryptPwd(clearPwd)
	}

	return pwdToCompare === referencePwd;
}

function isEncrypted(pwd: string) {
	return pwd.startsWith("#E") ? true : false;
}