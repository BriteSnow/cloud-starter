import * as crypto from 'crypto';
import { Response } from 'express';


export const cookieNameUserId = 'userId';
export const cookieNameAuthToken = 'authToken';


export async function setAuth(res: Response, data: { username: string, userId: number, pwd: string }) {
	const { username, userId, pwd } = data;

	const authToken = await createAuthToken(userId, username, pwd)

	const oneWeek = 7 * 24 * 3600 * 1000;
	res.cookie(cookieNameUserId, `${userId}`, { maxAge: oneWeek });
	res.cookie(cookieNameAuthToken, authToken);
}

/** Retun a one way hash authToken that can be sent to the client for future auth */
export async function createAuthToken(userId: number, username: string, pwd: string): Promise<string> {
	const pepper = ' -- yeah sure';
	const secret = 'cloud-rocks';
	const val = username + ' -- ' + pwd + pepper;
	const hash = crypto.createHmac('sha256', secret).update(val).digest('hex');
	return hash;
}