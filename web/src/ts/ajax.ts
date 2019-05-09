// --------- AJAX Wrapper --------- //
// Very simple AJAX wrapper that allow us to simply normalize request/response accross the application code.
// 
// Note: We start with just a minimalistic implementation, if more is needed, we can use some AJAX library while keeping the same
// application APIs. 

// use for get and list
export function ajaxGet(path: string, data?: any, opts?: any) {
	return _ajax('GET', path, data, opts);
}

// use for create 
export function ajaxPost(path: string, data?: any, opts?: any) {
	return _ajax('POST', path, data, opts);
}

// use for update
export function ajaxPut(path: string, data?: any, opts?: any) {
	return _ajax('PUT', path, data, opts);
}

// use for delete
export function ajaxDelete(path: string, data?: any) {
	return _ajax('DELETE', path, data, null);
}

// patch
export function ajaxPatch(path: string, data?: any) {
	return _ajax('PATCH', path, data, null);
}


var defaultOpts = {
	contentType: "application/json"
};

function _ajax(type: string, path: string, data?: any, opts?: any): Promise<any> {
	opts = Object.assign({}, defaultOpts, opts);

	// if asBody is not defined
	var asBody = (opts.asBody == null && (type === 'POST' || type === 'PUT' || type === 'PATCH'));

	return new Promise(function (resolve, reject) {
		var xhr = new XMLHttpRequest();

		var url = path;

		if (data && !asBody) {
			url += "?" + param(data);
		}

		xhr.open(type, url);

		xhr.setRequestHeader("Content-Type", opts.contentType);

		xhr.onload = function () {
			if (xhr.status === 200) {
				try {
					var response = xhr.responseText;
					var result: any;

					// if the content type was application/json, then, just parse it
					if (opts.contentType === "application/json" || opts.contentType.startsWith("multipart/form-data")) {
						result = JSON.parse(response);
					}
					// parse the XML as well
					else if (opts.contentType === "application/xml") {
						result = new DOMParser().parseFromString(response, "application/xml");
					}

					resolve(result);
				} catch (ex) {
					reject("Cannot do ajax request to '" + url + "' because \n\t" + ex);
				}
			} else {
				handleError(xhr, url, reject);
			}
		};

		xhr.onerror = function () {
			handleError(xhr, url, reject);
		}

		// pass body
		if (asBody) {
			if (opts.contentType.startsWith("multipart/form-data")) {
				console.log(`send with formData`);
				var formData = new FormData();
				for (var k in data) {
					formData.append(k, data[k]);
				}
				xhr.send(formData);
			} else {
				const xhrData = JSON.stringify(data);
				xhr.send(xhrData);
			}
		} else {
			xhr.send();
		}

	});
}

function handleError(xhr: XMLHttpRequest, url: string, reject: Function) {
	// Note: Here we do not look at the responseType and just deduct the type with the response text first char. 
	if (xhr.responseText && xhr.responseText.startsWith('{')) {
		const obj = JSON.parse(xhr.responseText);
		reject(obj);
	} else {
		reject("xhr.status '" + xhr.status + "' for ajax " + url);
	}
}

/** Build a URI query string from js object */
function param(obj: any) {
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
