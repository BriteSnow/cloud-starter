import { srouter } from '../express-utils';
import { userDao, oauthDao } from 'common/da/daos';
import { getSysContext } from 'common/context';
import { setAuth } from '../auth';
import { getAccessToken, getUserInfo } from 'common/service/github';
import { getConfig } from 'common/config';

const _router = srouter();

_router.get('/gh-auth-href', async function (req, res, next) {
	const githubConf = await getConfig('github');
	const client_id = githubConf.client_id;
	return { success: true, data: `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=repo%20user:email` };
});

_router.get('/gh-callback', async function (req, res, next) {

	// get the access token
	const access_token = await getAccessToken(req.query.code);

	//// get user information
	const { login, email, name } = await getUserInfo(access_token);

	//#region    ---------- Create/Update user/oauth as needed ---------- 
	const ctx = await getSysContext();
	const token = access_token!;
	const username = login;

	const user = await userDao.getByUsername(ctx, username);
	const pwd = (user) ? user.pwd! : token;
	let userId: number;

	let msg = '';

	// if we have a user, we update the oauth
	if (user) {
		userId = user.id;
		let oauthId: number;
		const oauth = await oauthDao.first(ctx, { userId });
		if (oauth) {
			oauthId = await oauthDao.update(ctx, oauth.id, { token });
		} else {
			oauthId = await oauthDao.create(ctx, { userId, token });
		}
		msg += `user already existing: ${userId} oauthId: ${oauthId}`;
	}
	// if no user, create the new user and oauth
	else {
		// if new user, then the password with the token
		// TODO: for now this means that the first token will be the pwd until user changes it. 
		//       We need to decide if we want to update the pwd on subsequent oauth
		userId = await userDao.create(ctx, { username, pwd, type: 'user' });
		const oauthId = await oauthDao.create(ctx, { userId, token });
		msg += `new user userId: ${userId} oauthId: ${oauthId}`;
	}
	//#endregion ---------- /Create/Update user/oauth as needed ---------- 

	// TODO: needs to add auth cookie here

	await setAuth(res, { username, userId, pwd });

	res.redirect('/'); // by default, 302

	// NOTE: Here we do not return anything, which tell the simple-router handler that this method handled the request completely (here called the redirect)
});


export const router = _router;