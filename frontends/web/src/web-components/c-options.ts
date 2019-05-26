import { all, first, on } from "mvdom";
import { attr } from "mvdom-xp";
import { BaseFieldElement } from "./c-base";

/**
 * c-options custom element encapsulate a label/input field group ()`c-input > label, input`) structure.
 * component styles are global but scoped via css naming (see c-input.pcss).
 *
 * Usage: `<c-options name="state" values="1:Open, 0:Close, 2 : Both" value="0"></c-options>`
 * See:  SpecControlsView.tmpl, SpecControlsView.ts
 * 
 * Component Attributes:
 *   - name: (optional) See BaseFieldElement.
 *   - value: (optional) See BaseFieldElement. String matching the "value" part of value
 *   - values: (required) possible values with format [value: label, value: label] (0: cat, 1: dog). 
 *             'value' act as a key, can be be any string (value and label will be trimmed)
 *             e.g., values='0: cat, 1: dog, 2: lion'
 * 
 * Component States:
 *   - name: read only (for now) from the 'name' attribute
 *   - value: Return the current value selected ('0' or '1' or '2' from the above example)
 */

class OptionsElement extends BaseFieldElement {

	//#region    ---------- Component States ---------- 
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
	//#endregion ---------- /Component States ---------- 

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
		});
	}

}

customElements.define("c-options", OptionsElement);
