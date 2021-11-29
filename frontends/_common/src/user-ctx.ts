import { getData, webGet, webPost } from 'common/web-request.js';

export interface UserContext {
	id: number;
	name: string;
	username: string;
}

export async function login(username: string, pwd: string) {
	const r = await webPost('/api/login', { body: { username, pwd } });
	return r;
}

export async function logoff() {
	const r = await webPost('/api/logoff');
	return r;
}

export async function getUserContext(): Promise<UserContext | null> {
	const ucResult = await webGet('/api/user-context');
	return (ucResult && ucResult.success) ? ucResult.data : null;
}

export async function getGoogleOAuthUrl(): Promise<string | null> {
	const result = await webGet('/google_oauth_url');
	const data = getData(result, true) as any;
	if (data && data.url) {
		return data.url
	} else {
		return null;
	}
}