// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/services/_common/src/security/token.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

/////////////////////
// Module responsible to manage the web token label. 
// Format is: _uuid_b64_._exp_b64_._sign_b64_
////

import crypto from 'crypto';
import moment from 'moment';
import { WEB_TOKEN_DURATION, WEB_TOKEN_SALT } from '../conf.js';
import { Err } from '../error.js';
import { b64dec, b64enc, symbolDic } from '../utils.js';

//// Error codes for this module
const ERROR = symbolDic(
	'WRONG_TOKEN',
	'WRONG_TOKEN_FORMAT',
	'TOKEN_EXPIRED'
);

//// Types
/** Token data from token string */
export interface TokenData {
	readonly uuid: string;
	readonly exp: string;
	readonly sign_b64: string; // signature b64
}

/** User Credential needed for Token check and create */
export interface UserCredForToken {
	readonly uuid: string;
	readonly tsalt: string;
}

/**
 * Parse the token string into a TokeData object
 * @param token of format _uuid_b64_._exp_b64_._sign_b64_
 */
export function parseToken(token_string: string): TokenData {
	try {
		const parts = token_string.split('.');
		// token must be of format string.string.string
		if (parts.length !== 3) { throw new Error(); }

		const uuid = b64dec(parts[0]);
		const exp = b64dec(parts[1]);
		const sign_b64 = parts[2];

		return Object.freeze({ uuid, exp, sign_b64 });

	} catch {
		throw new Err(ERROR.WRONG_TOKEN_FORMAT);
	}
}

export function checkToken(token: TokenData, data: UserCredForToken) {
	try {

		// check expiration
		const now = moment();
		const tokenExpMoment = moment(token.exp);
		if (now.isAfter(tokenExpMoment)) {
			throw new Err(ERROR.TOKEN_EXPIRED);
		}

		// check that token uuid match data.uuid
		// Note: this should mostly pass since the data should have been loaded from token.uuid
		if (token.uuid !== data.uuid) { throw new Error(); }

		// check the actual & expected signature
		const actual_sign_b64 = token.sign_b64;
		const expected_sign_b64 = sign(data, token.exp);
		if (actual_sign_b64 !== expected_sign_b64) {
			throw new Err(ERROR.WRONG_TOKEN);
		}
	}
	// Note: By design, minimum info.
	catch {
		throw new Err(ERROR.WRONG_TOKEN);
	}

}

export function createToken(data: UserCredForToken, exp: string) {
	const sign_b64 = sign(data, exp);
	return `${b64enc(data.uuid)}.${b64enc(exp)}.${sign_b64}`;
}

export function newExpiration() {
	return moment().add(WEB_TOKEN_DURATION, 'seconds').utc().toISOString();
}

function sign(data: UserCredForToken, exp: string) {
	const hash = crypto.createHmac('sha256', WEB_TOKEN_SALT + data.tsalt);
	hash.update(data.uuid + exp);
	return hash.digest('base64');
}
