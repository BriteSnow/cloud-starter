// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-bigapp/master/frontends/web/src/web-components/c-menu.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { BaseHTMLElement } from 'dom-native';



/**
 * Simple menu component. Does not do any processing or event binding (passthrough component).
 * 
 * Content: (display as is)
 *   - The first level children can be `div` or `a`
 * 
 */
class MenuElement extends BaseHTMLElement { }

customElements.define("c-menu", MenuElement);