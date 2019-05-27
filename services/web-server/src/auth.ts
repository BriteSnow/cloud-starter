import * as crypto from 'crypto';
import { Response } from 'express';
import { AppError } from 'common/error';


export const COOKIE_USERID = 'userId';
export const COOKIE_AUTHTOKEN = 'authToken';

export class AuthFailError extends AppError { }

export async function setAuth(res: Response, data: { username: string, id: number, key: string }) {
	const { username, id: userId, key } = data;

	const authToken = await createAuthToken(userId, username, key)

	const oneWeek = 7 * 24 * 3600 * 1000;
	res.cookie(COOKIE_USERID, `${userId}`, { maxAge: oneWeek });
	res.cookie(COOKIE_AUTHTOKEN, authToken);
}

// remove all of the auth cookies
export function clearAuth(res: Response) {
	res.clearCookie(COOKIE_USERID);
	res.clearCookie(COOKIE_AUTHTOKEN);
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