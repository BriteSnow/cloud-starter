import { Next } from 'koa';
import { extname } from 'path';
import { asNum } from 'utils-min';
import { userDao } from '../da/daos';
import { checkToken, parseToken, UserCredForToken } from '../security/token';
import { getSysContext, newUserContext, UserForContext } from '../user-context';
import { symbolDic } from '../utils';
import { AuthFailErr, clearAuth, extractToken, setAuth } from './auth';
import { Ktx } from './koa-utils';

const ERROR = symbolDic(
	'INVALID_AUTH'
);

export default async function authRequestMdw(ktx: Ktx, next: Next) {
	// for now, if no extension, then assume it is an API, so, authenticate
	if (!extname(ktx.path) && !ktx.path.endsWith('/')) {
		try {
			const start = Date.now();
			const user = await authRequest(ktx);

			// now we make kits a ApiKtx
			const utx = await newUserContext(user);
			ktx.state.utx = utx;
			// Note: here we do not use the perfContext.start and end, because the utx get created after we want to measure it
			utx.perfContext.add('auth', Date.now() - start);

			return next();
		} catch (ex) {
			// '/api/user-context' when no user is not an error, just returns success false
			if (ktx.path === '/api/user-context') {
				if (ex instanceof AuthFailErr) {
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


async function authRequest(ktx: Ktx): Promise<UserForContext> {
	const sysCtx = await getSysContext();
	const cookieAuthToken = extractToken(ktx);

	// Note: By design, the throw are information less to not give too much information in log stack. Can be extended later.
	try {
		// check cookie  exist
		if (cookieAuthToken == null) { throw new Error() }

		const tokenData = parseToken(cookieAuthToken);
		const { uuid } = tokenData;
		const { id, tsalt, accesses } = await userDao.getUserCredForAuth(sysCtx, { uuid });
		const cred: UserCredForToken = Object.freeze({ uuid, tsalt }); // make sure can't be tampered between check and setAuth
		checkToken(tokenData, cred);
		setAuth(ktx, cred);
		const wksId = asNum(ktx.query.wksId as string) ?? undefined;

		return { id, accesses, wksId };

	} catch {
		throw new AuthFailErr(ERROR.INVALID_AUTH);
	}

}


