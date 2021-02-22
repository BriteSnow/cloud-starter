import { userDao } from 'common/da/daos';
import { checkToken, parseToken, UserCredForToken } from 'common/security/token';
import { getSysContext, newUserContext, UserForContext } from 'common/user-context';
import { Next } from 'koa';
import { extname } from 'path';
import { asNum } from 'utils-min';
import { AuthFailError, clearAuth, extractToken, setAuth } from '../auth';
import { Ktx } from './koa-utils';

//#region    ---------- ERROR ---------- 
const ERROR_INVALID_AUTH = 'INVALID_AUTH';
//#endregion ---------- /ERROR ---------- 

export default async function authRequestMiddleware(ktx: Ktx, next: Next) {
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


export async function authRequest(ktx: Ktx): Promise<UserForContext> {
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
		throw new AuthFailError(ERROR_INVALID_AUTH);
	}

}


