import * as Path from 'path';
import { CDN_BASE_URL } from '../conf';
import { Ktx, Next } from './koa-utils';

/**
 * DONE:
 * 	- HSTS - Strict-Transport-Security: max-age=32000000; includeSubDomains // ~1+ year
 * 	- Access-Control-Allow-Origin
 * 	- CSP - content security policy - https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
 * 	- X-Frame-Options
 * 	- X-Content-Type-Options
 * 	- Referrer-Policy
 * 	- X-XSS-Protection (not really needed since CSP)
 *
 * N/A controls:
 * 	- expires          - N/A - MDN: If there is a Cache-Control header with the max-age or 
 * 												     s-maxage directive in the response, the Expires header is ignored.
 * 	- feature-policy   - N/A - This is more for web site that have external javascript plugins (e.g., wordpress). 
 * 													   This will be a Web App where the code only comes from 'self'.
 * 	- WWW-Authenticate - N/A - We do not use basic http authentication for these web applications authentication.
 *                             (we use high-entropy signed token in single http-only cookie)
 */


// versioned static files
const SEC_1YEAR = 3600 * 24 * 365;
// other static files
const SEC_1DAY = 3600 * 24;

const CSP_TXT = `default-src 'self' ${CDN_BASE_URL};
		font-src  'self' https://fonts.gstatic.com/;
		style-src 'self' https://fonts.googleapis.com 'sha256-A6vjruJejruUybf2VEMoknqUi70/IHAxt4bLAt4TK0Q=';
`;

const CSP_STRING = CSP_TXT.split(';').map(s => s.trim()).join('; ');

export function owaspHeadersMdw() {

	return function (ktx: Ktx, next: Next) {
		const pathInfo = Path.parse(ktx.path);

		// request type
		const isAPI = pathInfo.dir == '/api' || pathInfo.dir == '/wapi';
		const isStatic = !isAPI && pathInfo.ext != '';
		const isHTMLPath = !isAPI && (!isStatic || pathInfo.ext == '.html');

		// for CORS
		ktx.res.setHeader("Access-Control-Allow-Origin", `https://${ktx.hostname}`);
		// for content type integrity
		ktx.res.setHeader('X-Content-Type-Options', 'nosniff');

		// for sticky https (will be ignored if only accessed with HTTP by spec design)
		ktx.res.setHeader('Strict-Transport-Security', 'max-age=32000000; includeSubDomains');

		if (isHTMLPath) {
			// to make sure we get the latest static file versions
			ktx.res.setHeader('Cache-Control', 'no-cache');

			// for iframe
			ktx.res.setHeader('X-Frame-Options', 'DENY');
			ktx.res.setHeader('Referrer-Policy', 'no-referrer')

			let csp_string = CSP_STRING;

			// only for the sprite-demo page
			if (ktx.path == '/svg/sprite-demo.html')
				csp_string += " script-src 'self' https://demo.dom-native.org/";

			ktx.res.setHeader('Content-Security-Policy', csp_string);

			// kind of unnecessary given CSP (older browsers)
			ktx.res.setHeader('X-XSS-Protection', '1; mode=block');
		}

		else if (isStatic) {
			if (ktx.query.v) {
				ktx.res.setHeader('Cache-Control', `max-age=${SEC_1YEAR}`);
			} else {
				ktx.res.setHeader('Cache-Control', `max-age=${SEC_1DAY}`);
			}

		}
		// if frontend api (wapi/) or public api (api/), same rule
		else if (isAPI) {
			ktx.res.setHeader('Cache-Control', 'no-cache');
		}
		// catch all, but should not happen
		else {
			ktx.res.setHeader('Cache-Control', 'no-cache');
		}




		return next();
	}

}
