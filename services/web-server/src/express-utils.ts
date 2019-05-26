// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/services/web-server/src/express-utils.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)


import { Request, Response, NextFunction, Router, RequestHandler } from 'express';
import { ApiResponse } from 'shared/api-types';

export { Request } from 'express';


export function success<T = any>(data: T): ApiResponse<T> {
	return { success: true, data };
}



//#region    ---------- srouter express async friendly router wrapper ---------- 

/// Simplified Router with full async / catch support, and will stream back return value by default. 
/// Also, can throw exception in handlers, and it will get handled correctly. 

export function srouter() {
	return new SRouter();
}

class SRouter {
	readonly expressRouter = Router();

	use(requestHandler: RequestHandler) {
		this.expressRouter.use(function (req: Request, res: Response, next: NextFunction) {
			return requestHandler(req, res, next);
		});
	}

	get(pathParam: string, requestHandler: RequestHandler) {
		this.expressRouter.get(pathParam, requestHandlerWrapper(requestHandler));
	}

	post(pathParam: string, requestHandler: RequestHandler) {
		this.expressRouter.post(pathParam, requestHandlerWrapper(requestHandler));
	}

	put(pathParam: string, requestHandler: RequestHandler) {
		this.expressRouter.put(pathParam, requestHandlerWrapper(requestHandler));
	}

	delete(pathParam: string, requestHandler: RequestHandler) {
		this.expressRouter.delete(pathParam, requestHandlerWrapper(requestHandler));
	}

	patch(pathParam: string, requestHandler: RequestHandler) {
		this.expressRouter.patch(pathParam, requestHandlerWrapper(requestHandler));
	}

	options(pathParam: string, requestHandler: RequestHandler) {
		this.expressRouter.options(pathParam, requestHandlerWrapper(requestHandler));
	}

	head(pathParam: string, requestHandler: RequestHandler) {
		this.expressRouter.head(pathParam, requestHandlerWrapper(requestHandler));
	}
}


function requestHandlerWrapper(requestHandler: RequestHandler): RequestHandler {

	return async function (req: Request, res: Response, next: NextFunction) {

		try {
			let r = requestHandler(req, res, next);

			// if we have a return value, we assume it needs to be streamed back
			if (r != null) {
				// If it is a promise, we resolve it (exception will be catch below)
				// Note: for this implementation, only support native promise
				if (r instanceof Promise) {
					r = await r;
				}

				// if we have a string
				if (typeof r === 'string') {
					// if no content time was set, set text/html
					if (!res.getHeader('Content-Type')) {
						res.header("Content-Type", "text/html");
					}
					res.send(r);
				}
				// if we have an object, we stream as json object
				else {
					res.json(r);
				}

			}
		} catch (ex) {
			next(ex);
		}
	}

}
//#endregion ---------- /srouter express async friendly router wrapper ----------
