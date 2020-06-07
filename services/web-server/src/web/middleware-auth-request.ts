import { userDao } from 'common/da/daos';
import { checkToken, parseToken, UserCredForToken } from 'common/security/token';
import { getSysContext, newUserContext } from 'common/user-context';
import { Next } from 'koa';
import { extname } from 'path';
import { UserType } from 'shared/entities';
import { freeze } from 'shared/utils';
import { AuthFailError, clearAuth, extractToken, setAuth } from '../auth';
import { ApiKtx, Ktx } from './koa-utils';

//#region    ---------- ERROR ---------- 
const ERROR_INVALID_AUTH = 'INVALID_AUTH';
//#endregion ---------- /ERROR ---------- 

export default async function authRequestMiddleware(ktx: Ktx, next: Next) {
	// for now, if no extension, then assume it is an API, so, authenticate
	if (!extname(ktx.path) && !ktx.path.endsWith('/')) {
		try {
			const user = await authRequest(ktx);
			// now we make kits a ApiKtx
			(<ApiKtx>ktx).state.utx = await newUserContext(user);
			return next();
		} catch (ex) {
			// '/api/user-context' when no user is not an error, just returns success false
			if (ktx.path === '/api/user-context') {
				if (ex instanceof AuthFailError) {
					clearAuth(ktx);
				}
				ktx.body = { success: false };
				return;
			}
			throw ex;
		}

	} else {
		return next();
	}

}


export async function authRequest(ktx: Ktx): Promise<{ id: number, type: UserType }> {
	const sysCtx = await getSysContext();
	const cookieAuthToken = extractToken(ktx);

	// Note: By design, the throw are information less to not give too much information in log stack. Can be extended later.
	try {
		// check cookie  exist
		if (cookieAuthToken == null) { throw new Error() }

		const tokenData = parseToken(cookieAuthToken);
		const { id, type, uuid, tsalt } = await userDao.getUserAuthCredentialByUuid(sysCtx, tokenData.uuid);
		const cred: UserCredForToken = freeze({ uuid, tsalt }); // make sure can't be tampered between check and setAuth
		checkToken(tokenData, cred);
		setAuth(ktx, cred);
		return { id, type };

	} catch {
		throw new AuthFailError(ERROR_INVALID_AUTH);
	}

}


