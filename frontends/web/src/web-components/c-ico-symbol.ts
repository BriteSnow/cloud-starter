// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/frontends/web/src/web-components/c-ico-symbol.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { BaseHTMLElement } from 'mvdom';

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
 * Attributes: 
 *   - none
 * 
 * Properties: 
 *   - none
 * 
 * Content:
 *   - icon name with the `ico-` prefix.
 * 
 * Properties: none
 * 
 */
class IcoElement extends BaseHTMLElement {

	//#region    ---------- Lifecycle ---------- 
	init() {
		const tc = this.textContent;
		let name = (tc) ? tc.trim() : null;
		if (name) {
			name = 'ico-' + name; // by convention
			this.classList.add(name);
			this.innerHTML = htmlSvgSymbol(name);
		}
	}
	//#endregion ---------- /Lifecycle ---------- 

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
 * Attributes: 
 *   - none
 * 
 * Properties:
 *   - none
 * 
 * Content:
 *   - symbol name
 * 
 */
class SymbolElement extends BaseHTMLElement {

	//#region    ---------- Lifecycle ---------- 
	init() {
		let tc = this.textContent;
		let name = (tc) ? tc.trim() : null;
		if (name) {
			this.classList.add(name);
			this.innerHTML = htmlSvgSymbol(name);
		}
	}
	//#endregion ---------- /Lifecycle ---------- 

}
customElements.define("c-symbol", SymbolElement);
//#endregion ---------- /c-ico ----------


