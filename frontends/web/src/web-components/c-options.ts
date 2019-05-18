import * as Handlebars from "handlebars";
import { closest, on, all } from "mvdom";
import { attr } from "ts/utils";

class OptionsElement extends HTMLElement {

	get value(): string | null {
		return this.getAttribute('value');
	}

	set value(v: string | null) {

		attr(this, 'value', v);

		const t = attr(this, 'value');

		const items = all(this, 'c-options > div');

		for (const item of items) {

			if (item.getAttribute('data-val') === v) {
				item.classList.add('sel');
			} else {
				item.classList.remove('sel');
			}
		}
	}

	constructor() {
		super();

		const [values, value] = attr(this, ['values', 'value']);

		let html = '';
		if (values) {
			for (const line of values.split(',')) {
				const [label, val] = line.split(':');
				const sel = (value == val) ? 'sel' : '';
				html += `  <div class="${sel}" data-val="${val}">${label}</div>\n`;
			}
			this.innerHTML = html;
		}

		on(this, 'click', 'c-options > div', (evt) => {
			const clickedItem = evt.selectTarget;
			const val = clickedItem.getAttribute('data-val');
			this.value = val;
		});
	}
}

customElements.define("c-options", OptionsElement);


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