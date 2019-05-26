import { getSysContext, newContext } from 'common/context';
import { oauthDao, userDao } from 'common/da/daos';
import { NextFunction, Request, Response } from 'express';
import { asNum } from 'common/utils';
import { extname } from 'path';
import { AuthFailError, clearAuth, COOKIE_AUTHTOKEN, COOKIE_OAUTHID, COOKIE_USERID, createAuthToken, setAuth } from '../auth';
import { srouter } from '../express-utils';


const _router = srouter();

_router.post('/api/logoff', async function (req, res, next) {
	clearAuth(res);
	return { success: true };
});


_router.get('/api/login', async function (req, res, next) {
	const emptyCtx = await getSysContext();
	const uname = req.query.username;
	const pwd = req.query.pwd;
	const userInfo = await userDao.getByUsername(emptyCtx, uname);

	if (userInfo && userInfo.pwd === pwd) {
		const userId = userInfo.id;
		const username = userInfo.username;
		const pwd = userInfo.pwd!;
		await setAuth(res, { username, id: userId, key: pwd });
		return { success: true, username, userId };
	} else {
		return { success: false, uname, message: `Wrong credential for user ${uname}` };
		//next(`wrong login for ${uname}`);
	}
});

_router.post('/api/register', async function (req, res, next) {
	const emptyCtx = await getSysContext();
	console.log('register', typeof req.body);

	const { username, pwd } = req.body;
	const data = { username, pwd };

	const id = await userDao.create(emptyCtx, data);

	return { success: true, data: { id, username } };
});

// the authentication hook
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

_router.get('/api/user-context', async function (req, res, next) {
	const sysCtx = await getSysContext();

	try {
		const user = await userDao.get(sysCtx, req.context.userId);
		const name = user.username; // for now the display name will be the user name
		return { success: true, data: { id: user.id, name, username: user.username } };
	} catch (ex) {
		return { success: false };
	}

});


//#region    ---------- Utils ---------- 
/** Authenticate a request and return userId or null if it did not pass */
async function authRequest(req: Request): Promise<{ id: number, username: string }> {
	const sysCtx = await getSysContext();
	const cookieUserId = asNum(req.cookies[COOKIE_USERID] as string | null);
	const cookieOAuthId = asNum(req.cookies[COOKIE_OAUTHID] as string | null);
	const cookieAuthToken = req.cookies[COOKIE_AUTHTOKEN];

	if (cookieUserId == null || cookieAuthToken == null) {
		throw new AuthFailError('No authentication in request');
	} else {
		try {
			let userId = cookieUserId;

			//// get the key/username from the oauth or user table
			let key, username;
			// get the key/username info from the oauth table for this user
			if (cookieOAuthId) {
				const oauth = await oauthDao.get(sysCtx, cookieOAuthId);
				if (oauth == null) {
					throw new AuthFailError(`OAuth [${cookieOAuthId}] not found.`)
				}
				if (oauth.userId !== userId) {
					throw new AuthFailError(`OAuth [${cookieOAuthId}] does not match the user in the cookie [${userId}]`);
				}
				// username/key will be from the oauth information
				username = oauth.oauth_username;
				key = oauth.oauth_token;
			}
			// otherwise, get it from the user table
			else {
				const user = await userDao.get(sysCtx, cookieUserId);
				username = user.username;
				key = user.pwd;
			}

			//// check and create the authToken from the username/key
			if (username == null || key == null) {
				throw new AuthFailError('username or key was not defined, cannnot authenticate');
			}
			const authToken = await createAuthToken(userId, username, key);

			if (cookieAuthToken === authToken) {
				return { id: userId, username };
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


export const routerAuth = _router;