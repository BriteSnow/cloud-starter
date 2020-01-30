import { ajaxGet, ajaxPost, getData } from './ajax';

export interface UserContext {
	id: number;
	name: string;
	username: string;
}

export async function login(username: string, pwd: string) {
	const r = await ajaxGet('/api/login', { username, pwd });
	return r;
}

export async function logoff() {
	const r = await ajaxPost('/api/logoff');
	return r;
}

export async function getUserContext(): Promise<UserContext | null> {
	const ucResult = await ajaxGet('/api/user-context');
	return (ucResult && ucResult.success) ? ucResult.data : null;
}

export async function getGoogleOAuthUrl(): Promise<string | null> {
	const result = await ajaxGet('/google_oauth_url');
	const data = getData(result, true) as any;
	if (data && data.url) {
		return data.url
	} else {
		return null;
	}
}