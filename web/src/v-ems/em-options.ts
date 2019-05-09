import * as Handlebars from "handlebars";
import { frag, on, trigger, closest, all } from "mvdom";
import { htmlIco } from "ts/utils";


Handlebars.registerHelper("options", function (values, selVal, options) {
	const css = (options.hash && options.hash.css) ? options.hash.css : '';

	// the last argument is always the helper info object, so, it does not count.
	let html = `<em class="options ${css}">\n`;
	for (const line of values.split(',')) {
		const [label, val] = line.split(':');
		const sel = (selVal == val) ? 'sel' : '';
		html += `  <div class="${sel}" data-val="${val}">${label}</div>\n`;
	}

	html += '</em>\n';
	return html;
});

function getVal(em: HTMLElement) {
	if (em.classList.contains('check-on')) {
		return 'on';
	} else {
		return 'off';
	}
}

on(document, 'click', 'em.options > div', (evt) => {
	const item = evt.selectTarget;
	const options = closest(item, 'em.options')!;

	for (const el of options.children) {
		if (el === item) {
			el.classList.toggle('sel');
		} else {
			el.classList.remove('sel');
		}
	}

});