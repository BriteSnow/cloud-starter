// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/services/_common/src/web/koa-app.ts" />
// (c) 2021 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import Koa from 'koa';
import koaBody from 'koa-body';
import koaSend from 'koa-send';
import koaStatic from 'koa-static';
import { extname } from 'path';
import { __version__ } from '../conf';
import routerApiUserContext from './api-user-context-router';
import authLoginAndRegisterRouter from './auth-login-register-router';
import authRequestMdw from './auth-request-mdw';
import { httpsGuardMdw } from './https-guard-mdw';
import { initKtxMdw, KCustom, KState } from './koa-utils';
import { owaspHeadersMdw } from './owasp-headers-mdw';
import { handleRequestWrapperMdw } from './request-wrapper-mdw';


const COOKIE__VERSION__ = '__version__';

// By best practices, all web server web-folder are under the web-folder/ directory. 
const WEB_FOLDER = 'web-folder/'

type AppMiddleware = Koa.Middleware<KState, KCustom, Koa>;

interface KoaAppOpts {
	token_name: string;
	beforeAuthMdws?: AppMiddleware[];
	apiMdws?: AppMiddleware[];
}
export class KoaApp extends Koa<KState, KCustom>{
	private opts: KoaAppOpts;

	constructor(opts: KoaAppOpts) {
		super();
		this.opts = opts;
	}

	async setup() {
		const app = this;
		const { beforeAuthMdws, apiMdws, token_name } = this.opts;

		//#region    ---------- SETUP MDWS ---------- 
		// upgrade the koa context to Ktx wich is ParameterizedContext<KState, KCustom>
		app.use(initKtxMdw({ token_name }));

		// set all of the owasp security headers
		app.use(owaspHeadersMdw());

		// set proxy to true to have x-forwarded-for, https://expressjs.com/en/guide/behind-proxies.html
		app.proxy = true;

		// set the body parser middleware
		app.use(koaBody({ multipart: true }));

		//// Handle error and log overall request 
		app.use(handleRequestWrapperMdw);

		//// https redirect when in a prox env (production)
		// Note: will not impact localhost development
		app.use(httpsGuardMdw);

		// set the app version cookie
		app.use(async function (ktx, next) {
			const oneYear = 7 * 24 * 3600 * 1000 * 52;
			const appVersionCookie = ktx.cookies.get(COOKIE__VERSION__);
			if (appVersionCookie !== __version__) {
				ktx.cookies.set(COOKIE__VERSION__, __version__, { maxAge: oneYear });
			}
			return next();
		});
		//#endregion ---------- /SETUP MDWS ---------- 

		//// APP BEFORE AUTH REQUEST - bind the before beforeAuthMdws app middleware
		if (beforeAuthMdws) {
			for (const mdw of beforeAuthMdws) {
				this.use(mdw);
			}
		}

		app.use(authLoginAndRegisterRouter('/api').middleware());

		//// AUTH REQUEST - Mount the authRequest router (will set the req.context)
		app.use(authRequestMdw);

		//// COMMON API - MOUNT the /api/user-context/ API (special API that does not throw exception if not authenticated)
		app.use(routerApiUserContext('/api').middleware());

		//// APP APIs
		if (apiMdws) {
			for (const mdw of apiMdws) {
				this.use(mdw);
			}
		}


		//// STATIC Path with no extension and not yet bound to API are assumed to be app state, and load the same index.html application
		// This allows the user to hit reload anytime and get the same application.
		app.use(async (ktx, next) => {
			// Assumption: if we are here, all API handlers took the request, and we just have a page render or static file (with extension)
			if (!extname(ktx.path)) {
				await koaSend(ktx, WEB_FOLDER + '/index.html');
			} else {
				return next();
			}
		});

		//// fall back on the static for path with extensions
		// This allows to have static files if they have not be bound above (images, .svg, .css, .js, ...)
		app.use(koaStatic(WEB_FOLDER));
	}

	start(port: number) {
		// start the server
		return this.listen(port);
	}
}