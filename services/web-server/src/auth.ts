// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/services/web-server/src/auth.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { UserAuthCredential } from 'common/da/dao-user';
import { AppError } from 'common/error';
import * as crypto from 'crypto';
import { Ktx } from 'web/koa-utils';


export const COOKIE_USERID = 'userId';
export const COOKIE_AUTHTOKEN = 'authToken';

export class AuthFailError extends AppError { }

export async function setAuth(ktx: Ktx, data: UserAuthCredential) {
	const { username, id: userId, key } = data;

	const authToken = await createAuthToken(userId, username, key)

	const oneWeek = 7 * 24 * 3600 * 1000;
	ktx.cookies.set(COOKIE_USERID, `${userId}`, { maxAge: oneWeek });
	ktx.cookies.set(COOKIE_AUTHTOKEN, authToken);
}

// remove all of the auth cookies
export function clearAuth(ktx: Ktx) {
	ktx.clearCookie(COOKIE_USERID);
	ktx.clearCookie(COOKIE_AUTHTOKEN);
}

/** Retun a one way hash authToken that can be sent to the client for future auth */
export async function createAuthToken(userId: number, username: string, key: string): Promise<string> {
	const pepper = ' -- pepper is healthier';
	const secret = 'cloud-rocks';
	const val = username + ' -- ' + key + pepper;
	const hash = crypto.createHmac('sha256', secret).update(val).digest('hex');
	// console.log(`\n--- create token for ${username}\n  key: ${key}\n  token: ${hash}`);
	return hash;
}