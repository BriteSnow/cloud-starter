require('../../common/src/setup-module-aliases');

import * as bodyParser from 'body-parser';
import { AppError } from 'common/error';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { NextFunction, Request, Response } from 'express';
import { extname, resolve } from 'path';
import { routerDseGenerics } from './web/router-dse-generics';
import { routerAuthGoogleOAuth } from './web/router-auth-google-oauth';
import { routerAuthLoginAndRegister } from './web/router-auth-login-register';
import { routerAuthRequest } from './web/router-auth-request';
import { routerApiUserContext } from './web/router-api-user-context';
import { routerApiHello } from './web/router-api-hello';
import { AuthFailError, clearAuth } from './auth';

const PORT = 8080;

console.log('... start web-server');

main();

async function main() {
	const app = express();

	// will be used for the static file fall back (APIs will take precedence) 
	const webDir = 'web-folder/'

	//// set express processing middlewares
	app.set('trust proxy', true); // to have the x-forwarded-for, https://expressjs.com/en/guide/behind-proxies.html
	app.use(cookieParser());
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));


	//// First handler doing https redirect in  when in a prox env (production)
	// Note: will not impact localhost development
	app.use(async function (req, res, next) {
		// HTTPS Redirect: if we have a forwarded protocol HTTPS (from load balancer, make sure it is https)
		const fwdProtocol = req.header('x-forwarded-proto');
		if (fwdProtocol && fwdProtocol === 'http') {
			const httpsUrl = 'https://' + req.hostname + req.originalUrl;
			res.redirect(301, httpsUrl); // temporary to allow changing later, but could be set to 301 to make it permanent. 
			return;
		}
		next();
	});

	//// Mount the login/register/oauth routers
	app.use(routerAuthGoogleOAuth.expressRouter);
	app.use(routerAuthLoginAndRegister.expressRouter);

	//// Mount the authRequest router (will set the req.context)
	app.use(routerAuthRequest.expressRouter);

	//// Mount the /api/user-context/ API (special API that does not throw exception if not authenticated)
	app.use('/api/', routerApiUserContext.expressRouter);


	//// Mount hello world demo api
	// Note: to remove once understood.
	app.use('/api/', routerApiHello.expressRouter);


	//// Mount DSE (Data Service Endpoint) Web APIs
	// generic dse as fall back. 
	// Note: Once the application mature, this might be removed all together if all exposed API you be explicit.
	app.use('/api/', routerDseGenerics.expressRouter);


	//// Mount all app uris to same index.html
	// Note: Path with not extension and not yet bound to API are assumed to be app state, and load the same index.html application
	//       This allows the user to hit reload anytime and get the same application.
	app.use((req, res, next: NextFunction) => {
		// Assumption: if we are here, all API handlers took the request, and we just have a page render or static file (with extension)
		if (!extname(req.path)) {
			res.sendFile(resolve(webDir + '/index.html'));
		} else {
			next();
		}
	});


	//// Fall back on the static for path with extensions
	// This allows to have static files if they have not be bound above (images, .svg, .css, .js, ...)
	app.use(express.static(webDir));

	//// error handling, must be last. 
	app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
		let error: any;

		if (err instanceof AuthFailError) {
			clearAuth(res);
			error = { code: err.code, message: err.message }
		} else if (err instanceof AppError) {
			error = { code: err.code, message: err.message }
		} else if (err instanceof Error) {
			error = { message: err.message }
		} else if (typeof err === 'string') {
			error = { message: err };
		} else {
			error = err;
		}

		res.status(500).json({ success: false, error });

		// TODO: add log
	});


	// start the server
	app.listen(PORT);
	console.log(`... listening at ${PORT}`);
}



