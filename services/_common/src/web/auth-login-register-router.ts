// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/services/web-server/src/web/router-auth-login-register.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { userDao } from '../da/daos';
import { Err } from '../error';
import { pwdCheck } from '../security/password';
import { getSysContext } from '../user-context';
import { symbolDic } from '../utils';
import { AuthFailErr, clearAuth, setAuth } from './auth';
import { AppRouter, Ktx, routePost } from './koa-utils';


const ERROR = symbolDic(
	'LOGIN_FAIL',
	'USERNAME_OR_PWD_EMPTY'
)

/**
 * Note: This use the AppRouter since it is before authentication, and so the ktx is just Ktx
 */
class AuthLoginRegisterRouter extends AppRouter {
	@routePost('/logoff')
	async logoff(ktx: Ktx) {
		clearAuth(ktx);
		return { success: true };
	}

	@routePost('/login')
	async login(ktx: Ktx) {
		const sysCtx = await getSysContext();
		const username = ktx.request.body.username;
		const clearPwd = ktx.request.body.pwd;

		try {
			const userCredential = await userDao.getUserCredForLogin(sysCtx, { username });

			if (pwdCheck(clearPwd, userCredential)) {
				await setAuth(ktx, userCredential);
				const { username, id: userId } = userCredential;
				return { success: true, username, userId };
			}
		} catch (ex) {
			// if already a AuthFailErr, then, passthrough
			if (ex instanceof AuthFailErr) {
				throw ex;
			}
			// if AppErr, then, we create a AuthFailErr with same rec
			else if (ex instanceof Err) {
				throw new AuthFailErr(ex.rec)
			}
			// otherwise, we careate a new AuthFailErr with generic LOGIN_FAIL error
			else {
				throw new AuthFailErr(ERROR.LOGIN_FAIL);
			}
		}
	}

	@routePost('/register')
	async register(ktx: Ktx) {
		const sysCtx = await getSysContext();

		const { username, pwd: clearPwd } = ktx.request.body;
		if (!username || !clearPwd) {
			throw new AuthFailErr(ERROR.USERNAME_OR_PWD_EMPTY);
		}

		const id = await userDao.createUser(sysCtx, clearPwd);
		const user = userDao.get(sysCtx, id);

		return { success: true, data: user };
	}
}

export default function apiRouter(prefix?: string) { return new AuthLoginRegisterRouter(prefix) };