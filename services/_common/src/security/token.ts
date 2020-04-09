// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/services/_common/src/security/token.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

/////////////////////
// Module responsible to manage the web token label. 
// Format is: _uuid_b64_._exp_b64_._sign_b64_
////

import crypto from 'crypto';
import moment from 'moment';
import { freeze } from 'shared/utils';
import { WEB_TOKEN_DURATION, WEB_TOKEN_SALT } from '../conf';
import { AppError } from '../error';
import { b64dec, b64enc } from '../utils';



//// Error codes for this module
const ERROR_TOKEN_WRONG = 'WRONG_TOKEN';
const ERROR_TOKEN_WRONG_FORMAT = 'WRONG_TOKEN_FORMAT';
const ERROR_TOKEN_EXPIRED = 'TOKENT_EXPIRED';


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
	readonly salt: string;
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

		return freeze({ uuid, exp, sign_b64 });

	} catch {
		throw new Error(ERROR_TOKEN_WRONG_FORMAT);
	}
}

export function checkToken(token: TokenData, data: UserCredForToken) {
	try {

		// check expiration
		const now = moment();
		const tokenExpMoment = moment(token.exp);
		if (now.isAfter(tokenExpMoment)) {
			throw new AppError(ERROR_TOKEN_EXPIRED);
		}

		// check that token uuid match data.uuid
		// Note: this should mostly pass since the data should have been loaded from token.uuid
		if (token.uuid !== data.uuid) { throw new Error(); }

		// check the actual & expected signature
		const actual_sign_b64 = token.sign_b64;
		const expected_sign_b64 = sign(data, token.exp);
		if (actual_sign_b64 !== expected_sign_b64) {
			throw new AppError(ERROR_TOKEN_WRONG);
		}
	}
	// Note: By design, minimum info.
	catch {
		throw new AppError(ERROR_TOKEN_WRONG);
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
	const hash = crypto.createHmac('sha256', WEB_TOKEN_SALT + data.salt);
	hash.update(data.uuid + exp);
	return hash.digest('base64');
}

