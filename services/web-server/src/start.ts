require('../../_common/src/setup-module-aliases');

import { __version__ } from 'common/conf';
import { AppError } from 'common/error';
import Koa, { Next } from 'koa';
import koaBody from 'koa-body';
import koaSend from 'koa-send';
import koaStatic from 'koa-static';
import { extname } from 'path';
import { AuthFailError, clearAuth } from './auth';
import dseGenerics from './web/dse-generics';
import { initKtx, KCustom, KState, Ktx } from './web/koa-utils';
import authRequestMiddleware from './web/middleware-auth-request';
import routerApiUserContext from './web/router-api-user-context';
import routerAuthGoogleOAuth from './web/router-auth-google-oauth';
import routerAuthLoginAndRegister from './web/router-auth-login-register';

const PORT = 8080;
const COOKIE__VERSION__ = '__version__';

main();

async function main() {
	const app = new Koa<KState, KCustom>();

	// upgrade the koa context to Ktx wich is ParameterizedContext<KState, KCustom>
	app.use(initKtx);

	// will be used for the static file fall back (APIs will take precedence) 
	const webDir = 'web-folder/'

	// set proxy to true to have x-forwarded-for, https://expressjs.com/en/guide/behind-proxies.html
	app.proxy = true;

	// set the body parser middleware
	app.use(koaBody());

	//// Handle error and log overall request 
	app.use(handleRequestOverall);

	//// https redirect when in a prox env (production)
	// Note: will not impact localhost development
	app.use(async function (ktx, next) {
		// HTTPS Redirect: if we have a forwarded protocol HTTPS (from load balancer, make sure it is https)
		const fwdProtocol = ktx.header['x-forwarded-proto'];
		if (fwdProtocol) {
			if (fwdProtocol === 'http') {
				const httpsUrl = 'https://' + ktx.hostname + ktx.originalUrl;
				ktx.redirect(httpsUrl); // temporary by default to allow changing later, but can be ktx.status = 301; to make it permanent
				return;
			} else {
				// TODO: Enable the code below when ready
				// // make sure the HTTPS_MODE is true, otherwise refuse connection
				// if (!HTTPS_MODE) {
				// 	throw Error("FATAL - service config does not have https 'https_mode' to true");
				// }
			}
		}
		return next();
	});

	// set the app version cookie
	app.use(async function (ktx, next) {
		const oneYear = 7 * 24 * 3600 * 1000 * 52;
		const appVersionCookie = ktx.cookies.get(COOKIE__VERSION__);
		if (appVersionCookie !== __version__) {
			ktx.cookies.set(COOKIE__VERSION__, __version__, { maxAge: oneYear });
		}
		return next();
	});


	//// Mount the login/register/oauth routers
	app.use(routerAuthGoogleOAuth().middleware());
	app.use(routerAuthLoginAndRegister('/api').middleware());

	//// Mount the authRequest router (will set the req.context)
	app.use(authRequestMiddleware);

	//// Mount the /api/user-context/ API (special API that does not throw exception if not authenticated)
	app.use(routerApiUserContext('/api').middleware());

	//// Mount DSE (Data Service Endpoint) Web APIs
	// generic dse as fall back. 
	// Note: Once the application mature, this might be removed all together if all exposed API you be explicit.
	app.use(dseGenerics('/api').middleware());


	//// Path with not extension and not yet bound to API are assumed to be app state, and load the same index.html application
	// This allows the user to hit reload anytime and get the same application.
	app.use(async (ktx, next) => {

		// Assumption: if we are here, all API handlers took the request, and we just have a page render or static file (with extension)
		if (!extname(ktx.path)) {
			await koaSend(ktx, webDir + '/index.html');
		} else {
			return next();
		}
	});

	//// fall back on the static for path with extensions
	// This allows to have static files if they have not be bound above (images, .svg, .css, .js, ...)
	app.use(koaStatic(webDir));

	// start the server
	app.listen(PORT);
	console.log(`--> web-server (${__version__}) - listening at ${PORT}`);
}



// for error handling: https://github.com/koajs/koa/wiki/Error-Handling
async function handleRequestOverall(ktx: Ktx, next: Next) {
	try {
		await next();
	} catch (err) {
		let error: any;
		let err_msg: string | undefined;

		if (err instanceof AuthFailError) {
			clearAuth(ktx);
			error = { code: err.code, message: err.message }
		} if (err instanceof AppError) {
			error = { code: err.code, message: err.message }
			err_msg = err.message;
		} else if (err instanceof Error) {
			error = { message: err.message }
			err_msg = err.message;
		} else if (typeof err === 'string') {
			error = { message: err };
			err_msg = err;
		} else {
			error = err;
			err_msg = '' + err;
		}

		ktx.status = 500;
		ktx.body = { error };
		console.log('ERROR - handleRequestOverall - err object:', err);
	}
}