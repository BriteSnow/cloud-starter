import * as Handlebars from "handlebars";

Handlebars.registerHelper("echo", function (cond: string, val: any) {
	return (cond) ? val : "";
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

