// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-bigapp/master/services/web-server/src/auth.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

/////////////////////
// Module responsible to set and get the auth data from the web request context (ktx)
////

import { HTTPS_MODE, WEB_TOKEN_DURATION } from 'common/conf';
import { AppError } from 'common/error';
import { createToken, newExpiration, UserCredForToken } from 'common/security/token';
import { Ktx } from 'common/web/koa-utils';


const COOKIE_WTOKEN = 'token';
const COOKIE_SECURE = HTTPS_MODE; // for local dev this will be false
const COOKIE_WTOKEN_SET_OPTIONS = Object.freeze({ maxAge: WEB_TOKEN_DURATION * 1000, httpOnly: true, secure: COOKIE_SECURE, sameSite: 'strict' } as const);

export class AuthFailError extends AppError { }

export function extractToken(ktx: Ktx) {
	return ktx.cookies.get(COOKIE_WTOKEN);
}

export async function setAuth(ktx: Ktx, data: UserCredForToken) {
	// create new auth token with new exp
	const authToken = createToken(data, newExpiration());
	ktx.cookies.set(COOKIE_WTOKEN, authToken, COOKIE_WTOKEN_SET_OPTIONS);
}

// remove all of the auth cookies
export function clearAuth(ktx: Ktx) {
	ktx.clearCookie(COOKIE_WTOKEN);
}