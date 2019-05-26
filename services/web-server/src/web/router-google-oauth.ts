import { google } from 'googleapis';
import { srouter, success } from '../express-utils';
import { OAuth2Client } from 'googleapis-common';
import { getConfig } from 'common/config';
import { AppError } from 'common/error';
import { userDao, oauthDao } from 'common/da/daos';
import { getSysContext } from 'common/context';
import { setAuth } from '../auth';
import { randomString } from 'common/utils';

// Module Error Code
const ErrorCode = Object.freeze({
	NO_GOOGLE_BACKEND_CREDENTIALS: 'NO_GOOGLE_BACKEND_CREDENTIALS'
})

const _router = srouter();

// return the OAuth2 URL for the user to click on to authenticate
_router.get('/google_oauth_url', async function (req, res, next) {
	const oauthClient = await getOAuth2Client();
	const url = (oauthClient != null) ? oauthClient.generateAuthUrl({ scope: ['email', 'profile'] }) : null;
	return success({ url });
});

/**
 * Handle the redirect from google oauth.
 * 
 * Will check if the user for this google email address exist in the db. 
 * - If user not found in db, auto create with access_token as password (should not be used anyway).
 * - Then, autenticate the user (set auth cookies) and return success. 
 * 
 * @throws exception if any issue. 
 */
_router.get('/goauth-redirect', async function (req, res, next) {
	const code = req.query.code;

	//// get the access token/credentials from cod
	const oauthClient = await getOAuth2Client();
	// Should not happen since this comes after we get the oauth_url
	if (oauthClient === null) {
		throw new AppError(ErrorCode.NO_GOOGLE_BACKEND_CREDENTIALS);
	}

	// This will provide an object with the access_token and refresh_token.
	// Save these somewhere safe so they can be used at a later time.
	const { tokens } = await oauthClient.getToken(code)

	oauthClient.setCredentials(tokens);


	//// get user info with 
	const info = await google.oauth2({ version: 'v2', auth: oauthClient }).userinfo.get();

	if (info && info.data && info.data.email && tokens.access_token) {
		// For this app, the oauth user email is the username (logic can change depending on app requirements)
		const oauth_username = info.data.email;

		//// get/create user
		const sysCtx = await getSysContext();
		let user = await userDao.getByUsername(sysCtx, oauth_username);


		if (user == null) {
			const pwd = (tokens.access_token) ? tokens.access_token.substring(0, 63) : randomString(63);
			const userId = await userDao.create(sysCtx, { username: oauth_username, pwd })
			user = await userDao.get(sysCtx, userId);
		}

		//// create/create oauth
		let oauth = await oauthDao.getForUserId(sysCtx, user.id);
		let oauthId: number | undefined;
		const { id: oauth_id, name: oauth_name, picture: oauth_picture } = info.data;

		let oauth_token; // the oauth_token stored in the db that will be used to create the authToken (will be used as the key to create the authToken hash)
		if (oauth == null) {
			oauth_token = tokens.access_token; // if new oauth, we take the first oauth_token,
			oauthId = await oauthDao.create(sysCtx, { userId: user.id, oauth_username, oauth_id, oauth_name, oauth_token, oauth_picture });
			oauth = await oauthDao.get(sysCtx, oauthId);
		}
		// if exist, update the latest piicture and name.
		else {
			oauthId = oauth.id;
			oauth_token = oauth.oauth_token; // take it from the db
			// Note: here we do not update the oauth_token in the db with the one just recieved, otherwise, other browsers logged in will be logged out.
			// TODO: can use user context
			await oauthDao.update(sysCtx, oauthId, { oauth_name, oauth_picture });
		}

		// now that we have the user and oauth object, we set the auth (set the cookies)
		// Note: here we use the oauth_token (from the db) as key, and add the oauthId since the oauth_token will be used to build the client authCookie
		await setAuth(res, { id: user.id, username: oauth_username, key: oauth_token, oauthId }); // force types pwd

		res.redirect(302, '/'); // 302 (temporary)
	}
	// if user throw exception
	else {
		throw new Error('Google OAuth Fail. Cause: no info back (email or access_token) from google oauth redirect');
	}
});


// return the google oauth client if appropriate config exists, otherwise, return null.
async function getOAuth2Client(): Promise<OAuth2Client | null> {
	const { client_id, client_secret, redirect_url } = await getConfig('google_oauth');
	// return null if not client. 
	if (!client_id || !client_secret) {
		return null;
	}
	return new google.auth.OAuth2(client_id, client_secret, redirect_url);
}

export const routerGoogleOAuth = _router;