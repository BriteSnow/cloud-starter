// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/services/web-server/src/web/router-auth-login-register.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { userDao } from 'common/da/daos';
import { pwdCheck } from 'common/security/password';
import { getSysContext } from 'common/user-context';
import { AuthFailError, clearAuth, setAuth } from '../auth';
import { AppRouter, Ktx, routePost } from './koa-utils';


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
		const uname = ktx.request.body.username;
		const clearPwd = ktx.request.body.pwd;
		const userCredential = await userDao.getUserAuthCredentialByUsername(sysCtx, uname);

		if (userCredential && pwdCheck(clearPwd, userCredential)) {
			await setAuth(ktx, userCredential);
			const { username, id: userId } = userCredential;
			return { success: true, username, userId };
		} else {
			throw new AuthFailError('Wrong username / password');
		}
	}

	@routePost('/register')
	async register(ktx: Ktx) {
		const sysCtx = await getSysContext();

		const { username, pwd: clearPwd } = ktx.request.body;
		if (!username || !clearPwd) {
			throw new AuthFailError("username or pwd can't be empty");
		}

		const id = await userDao.createUser(sysCtx, clearPwd);
		const user = userDao.get(sysCtx, id);

		return { success: true, data: user };
	}
}

export default function apiRouter(prefix?: string) { return new AuthLoginRegisterRouter(prefix) };