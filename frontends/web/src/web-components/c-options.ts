// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/frontends/web/src/web-components/c-options.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { all, first, on } from 'mvdom';
import { attr } from 'mvdom-xp';
import { BaseFieldElement } from './c-base';

/**
 * c-options custom element encapsulate a label/input field group ()`c-input > label, input`) structure.
 * component styles are global but scoped via css naming (see c-input.pcss).
 *
 * Usage: `<c-options name="state" values="1:Open, 0:Close, 2 : Both" value="0"></c-options>`
 * See:  http://localhost:8080/_spec/controls
 * 
 * Attributes:
 *   - See BaseFieldElement.
 *   - `value?`: See BaseFieldElement. String matching the "value" part of value. TODO: need to make reflective.
 *   - `values`: possible values with format [value: label, value: label] (0: cat, 1: dog). 
 *             'value' act as a key, can be be any string (value and label will be trimmed)
 *             e.g., values='0: cat, 1: dog, 2: lion'
 * 
 * Properties:
 *   - See BaseFieldElement.
 *   - `value`: Return the current value selected ('0' or '1' or '2' from the above example)
 * 
 * CSS:
 *   - See BaseFieldElement.
 * 
 * Content:
 *   - TBD
 * 
 * Events:
 *   - `CHANGE` see BaseFieldElement.
 */

class OptionsElement extends BaseFieldElement {

	//// Poperty (Value)
	get value(): string | null {
		const selEl = first('c-options > div.sel');
		return (selEl) ? selEl.getAttribute('data-val') : null;
	}

	set value(val: string | null) {
		const old = this.value;

		const items = all(this, 'c-options > div');

		for (const item of items) {

			if (item.getAttribute('data-val') === val) {
				item.classList.add('sel');
			} else {
				item.classList.remove('sel');
			}
		}

		if (val !== old) {
			this.triggerChange();
		}
	}

	//#region    ---------- Lifecycle ---------- 
	// Component initialization (will be called once by BaseHTMLElement on first connectedCallback)
	init() {
		super.init();

		const [values, value] = attr(this, ['values', 'value']);

		//// Build the component HTML
		let html = '';
		if (values) {
			for (const line of values.split(',')) {
				let [val, label] = line.split(':');
				val = val.trim();
				label = label.trim();
				const sel = (value == val) ? 'sel' : '';
				html += `  <div class="${sel}" data-val="${val}">${label}</div>\n`;
			}
			this.innerHTML = html;
		}

		//// Bind the internal component events
		on(this, 'click', 'c-options > div', (evt) => {
			const clickedItem = evt.selectTarget;
			const val = clickedItem.getAttribute('data-val');
			this.value = val;
			this.triggerChange();
		});
	}
	//#endregion ---------- /Lifecycle ---------- 

}

customElements.define("c-options", OptionsElement);
