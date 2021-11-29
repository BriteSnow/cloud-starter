// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/frontends/web/src/ts/web-request.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { isObject, isString, pruneEmpty } from 'utils-min';
import { getRouteWksId } from './route.js';

type WebMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface WebRequestOptions {
	contentType?: string; // override the inferred contentType
	body?: any;
	params?: any;
	headers?: { [name: string]: string }
}


// --------- AJAX Wrapper --------- //
// Very simple AJAX wrapper that allow us to simply normalize request/response accross the application code.
// 
// Note: We start with just a minimalistic implementation, if more is needed, we can use some AJAX library while keeping the same
// application APIs. 

// use for get and list
export async function webGet(path: string, opts?: WebRequestOptions) {
	return webRequest('GET', path, opts);
}

// use for create 
export function webPost(path: string, opts?: WebRequestOptions) {
	return webRequest('POST', path, opts);
}

// use for update
export function webPut(path: string, opts?: WebRequestOptions) {
	return webRequest('PUT', path, opts);
}

// use for delete
export function webDelete(path: string, opts?: WebRequestOptions) {
	return webRequest('DELETE', path, opts);
}

// patch
export function webPatch(path: string, opts?: WebRequestOptions) {
	return webRequest('PATCH', path, opts);
}

// extract the data from result and if success returns it or not throw error.
// TODO: add conditional typing to not include null if nullOnFail is false
export function getData<T = unknown>(result: { success: boolean, data: T }, nullOnFail = false): T | null {
	if (!result || !result.success) {
		if (nullOnFail) {
			return null;
		} else {
			throw result;
		}

	} else {
		return result.data;
	}
}

const emptyWebRequestOptions: WebRequestOptions = Object.freeze({});

export async function webRequest(method: WebMethod, path: string, opts?: Partial<WebRequestOptions>): Promise<any> {
	let { contentType, body, params, headers } = opts ?? emptyWebRequestOptions;
	//// Compute body and contentType
	if (body instanceof FormData) {
		// NOTE: do not set contentType (fetch does the right thing when FormData)
	} else if (isObject(body)) {
		body = JSON.stringify(body);
		contentType = 'application/json';
	} else if (isString(body)) {
		contentType = 'text/plain'
	}

	//// Set the eventual Scoped entity as params
	const wksId = getRouteWksId();
	if (wksId != null) {
		(params = params ?? {}).wksId = wksId;
	}

	//// Add params to url if defined
	if (params != null) {
		const urlParams = urlEncodeParams(params);
		path += path.includes('?') ? `&${urlParams}` : `?${urlParams}`;
	}

	//// Define headers
	if (contentType) {
		(headers = headers ?? {})['Content-Type'] = contentType;
	}


	const fetchRequestInit: RequestInit = pruneEmpty({ method, headers, body });
	const fetchResponse = await fetch(path, fetchRequestInit);
	// if the content type was application/json, then, just parse it
	const resContentType = fetchResponse.headers.get('content-type');

	if (resContentType) {
		// TODO: need to check multipart handler
		if (resContentType.includes("application/json") || resContentType?.startsWith("multipart/form-data")) {
			return fetchResponse.json();
		}
		// if end with example, i.e. svg, parse as xml
		else if (resContentType?.endsWith('xml')) {
			const bodyText = await fetchResponse.text();
			return new DOMParser().parseFromString(bodyText, "application/xml");
		}
	} else {
		// assume text for now
		return fetchResponse.text();
	}

}


/** Build a URI query string from js object */
function urlEncodeParams(obj: any) {
	var encodedString = '';
	for (var prop in obj) {
		if (obj.hasOwnProperty(prop)) {

			if (encodedString.length > 0) {
				encodedString += '&';
			}

			let val = obj[prop];

			// if no value (null or undefined), then, we ignore
			if (val == null) {
				continue;
			}

			// if the value is an object or array, then, we stringify (for serialization)
			if (typeof val === 'object' || val instanceof Array) {
				// stringify
				val = JSON.stringify(val);
			}

			// always uri encode the value (it will get decoded automatically on the server)
			encodedString += prop + '=' + encodeURIComponent(val);
		}
	}
	return encodedString;
}
