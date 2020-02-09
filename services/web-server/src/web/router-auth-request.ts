import { getSysContext, newContext } from 'common/context';
import { userDao } from 'common/da/daos';
import { asNum } from 'common/utils';
import { NextFunction, Request, Response } from 'express';
import { extname } from 'path';
import { UserType } from 'shared/entities';
import { AuthFailError, clearAuth, COOKIE_AUTHTOKEN, COOKIE_USERID, createAuthToken } from '../auth';
import { srouter } from '../express-utils';

const _router = srouter();


// The requestAuth hook
//   - Will autenticate all request path with extension except '/' and '/api/user-context'
//   - Will skip exception for /api/user-context
_router.use(async function (req: Request, res: Response, next: NextFunction) {

	// for now, if no extension, then assume it is an API, so, authenticate
	if (!extname(req.path) && !req.path.endsWith('/')) {
		try {
			const user = await authRequest(req);
			req.context = await newContext(user);
			next();
			return;
		} catch (ex) {
			// '/api/user-context' when no user is not an error, just returns success false
			if (req.path === '/api/user-context') {
				if (ex instanceof AuthFailError) {
					clearAuth(res);
				}
				res.json({ success: false });
				return;
			}
			next(ex);
		}

	} else {
		next();
	}

});

//#region    ---------- Utils ---------- 
/** Authenticate a request and return userId or null if it did not pass */
async function authRequest(req: Request): Promise<{ id: number, type: UserType, username: string }> {
	const sysCtx = await getSysContext();
	const cookieUserId = asNum(req.cookies[COOKIE_USERID] as string | null);
	const cookieAuthToken = req.cookies[COOKIE_AUTHTOKEN];

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


//#endregion ---------- /Utils ---------- 


export const routerAuthRequest = _router;