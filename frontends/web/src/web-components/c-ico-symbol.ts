// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/frontends/web/src/web-components/c-ico-symbol.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { BaseHTMLElement } from "./c-base";

/** Public api to generage a symbol svg reference */
export function htmlSvgSymbol(name: string) {
	var html = ['<svg class="symbol ' + name + '">'];
	html.push('<use xlink:href="#' + name + '"></use>');
	html.push('</svg>');
	return html.join('\n');
}

//#region    ---------- c-ico ---------- 
/**
 * Component that display an icon icon stored in the symbols svg. 
 * 'ico-[name]' will be added as component class name and used for the symbol name. 
 * 
 * Usage: `<c-ico>user</c-ico>`
 * 
 * Component Attributes: 
 *   - 'name' Name of the ico, without the 'ico-' prefix ('ico-' prefix will be added). 
 *            if absent, nothing will be displayed. 
 * 
 * Component States: no states at this point. 
 * 
 */
class IcoElement extends BaseHTMLElement {

	init() {
		let name = this.innerText.trim();

		if (name) {
			name = 'ico-' + name; // by convention
			this.classList.add(name);
			this.innerHTML = htmlSvgSymbol(name);
		}
	}
}
customElements.define("c-ico", IcoElement);
//#endregion ---------- /c-ico ---------- 


//#region    ---------- c-symbol ---------- 
/**
 * Component that display an svg symbol, but does not have the 'icon' semantic. 
 * Full name of the symbol needs to be given. 
 * Will add the symbol name as css class.
 * 
 * Usage: `<c-symbol>ico-user</c-symbol>`
 * 
 * Component Attributes: 
 *   - 'name' Full name of the svg symbol. 
 * 
 * Component States: no states at this point. 
 * 
 */
class SymbolElement extends BaseHTMLElement {

	init() {
		let name = this.innerText.trim();

		if (name) {
			this.classList.add(name);
			this.innerHTML = htmlSvgSymbol(name);
		}
	}
}
customElements.define("c-symbol", SymbolElement);
//#endregion ---------- /c-ico ----------


