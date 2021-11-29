import { HTTPS_MODE } from '../conf.js';
import { Err } from '../error.js';
import { HTTP_404 } from '../error-common.js';
import { Ktx, Next } from './koa-utils.js';


export async function httpsGuardMdw(ktx: Ktx, next: Next) {

	// HTTPS Redirect: if we have a forwarded protocol HTTPS (from cloud load balancer, make sure it is https)
	const fwdProtocol = ktx.header['x-forwarded-proto'];
	if (fwdProtocol) {

		// CONFIG GUARD - If fwdProtocol, then from a cloud LB, 
		//                and therefore MUST have the config HTTPS_MODE = true, otherwise fail
		if (!HTTPS_MODE) {
			throw Error("FATAL - service config does not have https 'https_mode' to true");
		}

		// HTTPS REDIRECT - Only if GET and to root (for user convenient)
		if (fwdProtocol === 'http') {
			if (ktx.request.method == "GET" && ktx.path == "/") {
				const httpsUrl = 'https://' + ktx.hostname + ktx.originalUrl;
				ktx.redirect(httpsUrl); // temporary by default to allow changing later, but can be ktx.status = 301; to make it permanent
				return;
			} else {
				throw new Err(HTTP_404);
			}
		}
	}
	return next();
}