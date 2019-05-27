// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/services/web-server/src/web/router-auth-login-register.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { getSysContext } from 'common/context';
import { userDao } from 'common/da/daos';
import { checkPwd, encryptPwd } from 'common/password';
import { AuthFailError, clearAuth, setAuth } from '../auth';
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
	const userCredential = await userDao.getUserCredential(emptyCtx, uname);

	if (userCredential && checkPwd(pwd, userCredential.pwd)) {
		const { username, id: userId } = userCredential;
		await setAuth(res, userCredential);
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
	// we encrypt the password
	const pwd = encryptPwd(clearPwd);
	const key = pwd; // Note: When register, user.key is set from user.pwd
	const data = { username, pwd, key };

	const id = await userDao.create(sysCtx, data);

	return { success: true, data: { id, username } };
});



export const routerAuthLoginAndRegister = _router;