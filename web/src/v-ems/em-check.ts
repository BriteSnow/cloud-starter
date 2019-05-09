import * as Handlebars from "handlebars";
import { htmlIco } from "ts/utils";
import { on, frag, empty, append, trigger } from "mvdom";

const defaultVal = 'off';

Handlebars.registerHelper("check", function (val: boolean | string) {
	// the last argument is always the helper info object, so, it does not count.
	if (arguments.length === 1) {
		val = defaultVal;
	}
	if (typeof val === 'boolean') {
		val = (val) ? 'on' : 'off';
	}
	return html(val);
});

function html(val: string) {
	let cssClass = 'check';
	let inner = '';
	if (val === 'on') {
		cssClass += ' check-on';
		inner += htmlIco('check-on');
	} else {
		cssClass += ' check-off';
		inner += htmlIco('check-off');
	}
	return `<em class="${cssClass}" data-val="${val}">${inner}</em>`;
}

function getVal(em: HTMLElement) {
	if (em.classList.contains('check-on')) {
		return 'on';
	} else {
		return 'off';
	}
}

on(document, 'click', 'em.check', (evt) => {
	const em = evt.selectTarget;
	const currentVal = getVal(em);
	const newVal = (currentVal === 'on') ? 'off' : 'on';
	const f = frag(html(newVal));
	const newEm = f.firstElementChild!;
	em.parentElement!.replaceChild(newEm, em);
	trigger(newEm, "CHANGE", { cancelable: true, detail: newVal });
});