
import crypto from 'crypto';
import { shortUuid } from 'utils-min';
import { PWD_PRLINK_SALT } from '../conf';

export interface PRLinkUserInfo {
	code: string; // rplink code uuid format
	userUuid: string;
	ctime: string; // UTC time of when the rplink was created
}


/**
 * Build the 'prp' URL param for the password reset link
 * _short_code_uuid_._sig_, where  _sig_ = sha256( rlink_salt + code_uuid + user_uuid + ctime).hex
 * Note:
 * 	- The rest link will be like `https://server/pwdreset?prp=_prp_value_
 * @param rplinkInfo 
 */
export function urlPrparam(info: PRLinkUserInfo) {
	const hash = buildHash(info);
	return shortUuid(info.code) + '.' + hash;
}

export function validateRpHash(urlRpHash: string, info: PRLinkUserInfo) {
	const expectedHash = buildHash(info);
	if (expectedHash != urlRpHash) {
		throw new Error('prp hash not matching');
	}
}

function buildHash(info: PRLinkUserInfo) {
	const hexHash = crypto.createHash("sha256").update(PWD_PRLINK_SALT +
		info.code +
		info.userUuid +
		info.ctime
	).digest("hex");

	// TODO: could shorten the "hex" to a base 58

	return hexHash;
}