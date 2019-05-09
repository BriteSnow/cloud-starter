import * as Handlebars from "handlebars";

import { frag } from "mvdom";


export function render(templateName: string, data?: any): DocumentFragment {

	// call the function and return the result
	return frag(renderAsString(templateName, data));
}

export function renderAsString(templateName: string, data?: any) {
	var tmpl = Handlebars.templates[templateName];

	// if not found, throw an error
	if (!tmpl) {
		throw "Not template found in pre-compiled and in DOM for " + templateName;
	}

	return tmpl(data);
}