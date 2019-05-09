import { srouter } from '../express-utils';
import { Request, Response, NextFunction } from 'express';
import { getSysContext, newContext } from 'common/context';
import { extname } from 'path';
import { userDao } from 'common/da/daos';
import { User } from 'shared/entities';
import { cookieNameUserId, cookieNameAuthToken, setAuth, createAuthToken } from '../auth';
import * as crypto from 'crypto';


const _router = srouter();

_router.post('/api/logoff', async function (req, res, next) {
	res.clearCookie(cookieNameUserId);
	res.clearCookie(cookieNameAuthToken);
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
		await setAuth(res, { username, userId, pwd });
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
async function authRequest(req: Request): Promise<User> {
	const sysCtx = await getSysContext();

	const cookieUserId: number | undefined = (req.cookies.userId) ? parseInt(req.cookies.userId) : undefined;
	const cookieAuthToken: string | undefined = req.cookies.authToken;

	if (cookieUserId == null || cookieUserId === NaN || cookieAuthToken == null) {
		throw new Error('No authentication in request');
	} else {
		try {
			const user = await userDao.get(sysCtx, cookieUserId);
			const authToken = await createAuthToken(user.id, user.username, user.pwd!);
			if (cookieAuthToken === authToken) {
				delete user.pwd;
				return user;
			} else {
				throw new Error('Wrong authentication in request');
			}
		} catch (ex) {
			throw new Error('Invalid authentication');
		}

	}

}


//#endregion ---------- /Utils ---------- 




export const router = _router;