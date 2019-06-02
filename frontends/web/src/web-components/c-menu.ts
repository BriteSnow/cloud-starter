// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/frontends/web/src/web-components/c-menu.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { BaseHTMLElement } from "./c-base";


/**
 * Simple menu component. Does not do any processing or event binding (passthrough component).
 * 
 * Content: (display as is)
 *   - The first level children can be `div` or `a`
 * 
 */
class MenuElement extends BaseHTMLElement {

	init() {
		super.init();
	}
}
customElements.define("c-menu", MenuElement);