// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/services/web-server/src/web/router-auth-google-oauth.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { getConfig } from 'common/config';
import { getSysContext } from 'common/context';
import { oauthDao, userDao } from 'common/da/daos';
import { AppError } from 'common/error';
import { encryptPwd } from 'common/password';
import { google } from 'googleapis';
import { OAuth2Client } from 'googleapis-common';
import { setAuth } from '../auth';
import { srouter, success } from '../express-utils';

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

	//// Get OAuth User Information
	const oauthClient = await getOAuth2Client();
	// Should not happen since this comes after we get the oauth_url
	if (oauthClient === null) {
		throw new AppError(ErrorCode.NO_GOOGLE_BACKEND_CREDENTIALS);
	}
	// This will provide an object with the access_token and refresh_token.
	// Save these somewhere safe so they can be used at a later time.
	const { tokens } = await oauthClient.getToken(code)
	// 
	oauthClient.setCredentials(tokens);
	// get user info with 
	const info = await google.oauth2({ version: 'v2', auth: oauthClient }).userinfo.get();

	//// if we have oauth user data, we proceed to authentication (and registration if needed)
	if (info && info.data && info.data.email && tokens.access_token) {
		// For this app, the oauth user email is the username (logic can change depending on app requirements)
		const oauth_username = info.data.email;
		const oauth_token = tokens.access_token;

		//// get eventual user
		const sysCtx = await getSysContext();
		let user = await userDao.getUserByUserName(sysCtx, oauth_username);

		//// auto create user for this user
		// Note: For application that should not have auto register, this should redirect to a no access page.
		if (user == null) {
			// In the oauth register case, the user.key will be the first encrypted version of the auth_token 
			const key = encryptPwd(oauth_token).substring(0, 127); // make sure it fits the table
			const userId = await userDao.create(sysCtx, { username: oauth_username, key })
			user = await userDao.get(sysCtx, userId);
		}

		//// create/create oauth
		let oauth = await oauthDao.getForUserId(sysCtx, user.id);
		let oauthId: number | undefined;
		const { id: oauth_id, name: oauth_name, picture: oauth_picture } = info.data;
		// if no oauth, create it
		if (oauth == null) {
			oauthId = await oauthDao.create(sysCtx, { userId: user.id, oauth_username, oauth_id, oauth_name, oauth_token, oauth_picture });
			oauth = await oauthDao.get(sysCtx, oauthId);
		}
		// if exist, update the latest piicture and name.
		else {
			oauthId = oauth.id;
			// Note: here we do not update the oauth_token in the db with the one just recieved, otherwise, other browsers logged in will be logged out.
			// TODO: can use user context
			await oauthDao.update(sysCtx, oauthId, { oauth_name, oauth_picture, oauth_token });
		}

		//// authenticate the user
		// now that we have the user and oauth object, we set the auth (set the cookies)
		const userCredential = await userDao.getUserCredential(sysCtx, user.id);
		await setAuth(res, userCredential); // force types pwd

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

export const routerAuthGoogleOAuth = _router;