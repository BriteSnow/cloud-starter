require('../../common/src/setup-module-aliases');
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { NextFunction, Request, Response } from 'express';
import { extname, resolve } from 'path';
import { router as routerAPI } from './web/router-api';
import { router as routerAuth } from './web/router-auth';
import { router as routerCrud } from './web/router-crud';
import { router as routerCrudTicket } from './web/router-crud-ticket';
import { router as routerGithubApi } from './web/router-github-api';
import { router as routerGithubOauth } from './web/router-github-oauth';


console.log('... start');

main();

async function main() {
	const app = express();

	// Adding the static middleware at the beginning means it wins out over any routes present
	// (but only interferes if the file exists)
	const webDir = 'web-folder/'

	app.use(cookieParser());

	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));

	// mount the github oauth router
	app.use(routerGithubOauth.expressRouter);

	// mount the auth router
	app.use(routerAuth.expressRouter);

	// mount github APIs
	app.use('/api/', routerGithubApi.expressRouter);

	// mount the API router
	app.use('/api/', routerAPI.expressRouter);

	app.use('/api/', routerCrudTicket.expressRouter);

	app.use('/api/', routerCrud.expressRouter);


	// Forwarding all non extension request to the index.html (since we use full URL path for states)
	app.use((req, res, next: NextFunction) => {
		// Assumption: if we are here, all API handlers took the request, and we just have a page render or static file (with extension)
		if (!extname(req.path)) {
			res.sendFile(resolve(webDir + '/index.html'));
		} else {
			next();
		}
	});

	// fall back on the static
	app.use(express.static(webDir));


	// error handling, must be last. 
	app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
		let error: any;
		if (err.message != null) {
			error = err.message;
		} else {
			error = err;
		}
		res.status(500).json({ error });
	});

	app.listen(8080);
}



