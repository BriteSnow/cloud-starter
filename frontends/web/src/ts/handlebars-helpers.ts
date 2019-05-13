import * as Handlebars from "handlebars";
import { htmlSymbol, htmlIco } from "./utils";

Handlebars.registerHelper("echo", function (cond: string, val: any) {
	return (cond) ? val : "";
});


Handlebars.registerHelper("ico", function (name: string, options: any) {
	let css = (options && options.hash && options.hash.css) ? options.hash.css : '';
	return htmlIco(name, css);
});

Handlebars.registerHelper("symbol", function (name: string, options: any) {
	return htmlSymbol(name);
});

// we can use like this {{{incl "tmpl-test" data ...}}}
Handlebars.registerHelper("incl", function (templateName: string, data: any, options: any) {
	var params = Array.prototype.slice.call(arguments, 1, arguments.length - 1);
	if (params.length == 1) {
		params = params[0];
	}

	var tmpl = Handlebars.templates[templateName];
	var html = tmpl(params);
	return html;
});

