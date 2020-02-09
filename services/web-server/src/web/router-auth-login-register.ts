// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/services/web-server/src/web/router-auth-login-register.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { getSysContext } from 'common/context';
import { userDao } from 'common/da/daos';
import { pwdCheck } from 'common/security/password';
import { AuthFailError, clearAuth, setAuth } from '../auth';
import { srouter } from '../express-utils';

const _router = srouter();

_router.post('/api/logoff', async function (req, res, next) {
	clearAuth(res);
	return { success: true };
});


_router.post('/api/login', async function (req, res, next) {
	const emptyCtx = await getSysContext();
	const uname = req.body.username;
	const clearPwd = req.body.pwd;
	const userCredential = await userDao.getUserAuthCredential(emptyCtx, uname);


	if (userCredential && pwdCheck(clearPwd, userCredential)) {
		await setAuth(res, userCredential);
		const { username, id: userId } = userCredential;
		return { success: true, username, userId };
	} else {
		throw new AuthFailError('Wrong username / password');
	}
});

_router.post('/api/register', async function (req, res, next) {
	const sysCtx = await getSysContext();
	console.log('register', typeof req.body);

	const { username, pwd: clearPwd } = req.body;
	if (!username || !clearPwd) {
		throw new AuthFailError("username or pwd can't be empty");
	}

	const id = await userDao.createUser(sysCtx, clearPwd);
	const user = userDao.get(sysCtx, id);

	return { success: true, data: user };
});



export const routerAuthLoginAndRegister = _router;