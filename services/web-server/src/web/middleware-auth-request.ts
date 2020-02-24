import { userDao } from 'common/da/daos';
import { getSysContext, newUserContext } from 'common/user-context';
import { asNum } from 'common/utils';
import { Next } from 'koa';
import { extname } from 'path';
import { UserType } from 'shared/entities';
import { AuthFailError, clearAuth, COOKIE_AUTHTOKEN, COOKIE_USERID, createAuthToken } from '../auth';
import { ApiKtx, Ktx } from './koa-utils';


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

/** Authenticate a request and return userId or null if it did not pass */
async function authRequest(ktx: Ktx): Promise<{ id: number, type: UserType, username: string }> {
	const sysCtx = await getSysContext();
	const cookieUserId = asNum(ktx.cookies.get(COOKIE_USERID) as string | null);
	const cookieAuthToken = ktx.cookies.get(COOKIE_AUTHTOKEN);

	if (cookieUserId == null || cookieAuthToken == null) {
		throw new AuthFailError('No authentication in request');
	} else {
		try {
			let userId = cookieUserId;

			//// get the key/username from user credential
			const { username, key, type } = await userDao.getUserAuthCredential(sysCtx, userId);

			//// Validation
			if (!username || !key) {
				throw new AuthFailError('username or key was not defined, cannnot authenticate');
			}

			const authToken = await createAuthToken(userId, username, key);

			if (cookieAuthToken === authToken) {
				return { id: userId, type, username };
			} else {
				throw new AuthFailError('Wrong authentication in request');
			}
		} catch (ex) {
			if (ex instanceof AuthFailError) {
				throw ex;
			}
			else {
				throw new AuthFailError(ex.message);
			}

		}

	}

}



