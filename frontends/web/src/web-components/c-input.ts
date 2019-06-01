// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/frontends/web/src/web-components/c-input.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { on } from "mvdom";
import { attr, elem, css } from "mvdom-xp";
import { BaseFieldElement } from "./c-base";


/**
 * c-input custom element encapsulate a label/input field group ()`c-input > label, input`) structure. 
 * component styles are global but scoped via css naming (see c-input.pcss). 
 * 
 * Usage: `<c-input name="fieldNameA" value="value A"></c-input>`
 * See:  SpecControlsView.tmpl, SpecControlsView.ts
 * 
 * Component Attributes: 
 *   - See BaseFieldElement.
 *   - `password?`: set input as password
 * 
 * Component Events: 
 *   - `CHANGE` see BaseFieldElement.
 * 
 * Component Poperties: 
 *   - See BaseFieldElement.
 *   - `password: boolean`: reflective of attribute.
 * 
 * Component CSS:
 *   - See BaseFieldElement.
 * 
 */

export class InputElement extends BaseFieldElement {

	static get observedAttributes() { return BaseFieldElement.observedAttributes.concat(['password']) }

	//// Component Key Children (on demand for more DOM mutation resiliency)
	inputEl!: HTMLInputElement;

	//// Attribute Reflective Properties
	get focused(): boolean { return this.classList.contains('focused') };
	set focused(b: boolean) { css(this, { focused: b }) };

	//// Properties
	get value() { return this.inputEl.value };
	set value(val: any) { // today takes any, will get parsed by standard html input element .value
		const inputEl = this.inputEl;
		const old = inputEl.value;

		// set the value. Note that if the UI call this setter, will always be ===
		if (val !== old) {
			inputEl.value = val;
		}

		// get the value from input so that we use the html input parsing behavior
		const newVal = this.value;

		// update the empty state
		this.noValue = (!(newVal && newVal.length > 0));

		// Note: If the UI call this setter, will always be ===
		//       however, it if is programmatic call, it might be different. so for now, we have to always trigger it. 
		this.triggerChange();
	};

	// Component initialization (will be called once by BaseHTMLElement on first connectedCallback)
	init() {
		super.init();
		let [label, value] = attr(this, ['label', 'value']);

		const type = this.hasAttribute('password') ? 'password' : 'text';

		//// Build the component HTML
		const tmp = document.createDocumentFragment();
		// create the DOM
		if (label) {
			tmp.appendChild(elem('label')).textContent = label;
		}
		this.inputEl = attr(elem('input'), { type, value }) as HTMLInputElement;
		tmp.appendChild(this.inputEl);
		// forward the relevant attribute to inputEl
		const [readonly, disabled, placeholder] = attr(this, ['readonly', 'disabled', 'placeholder']);
		attr(this.inputEl, { readonly, disabled, placeholder });
		this.appendChild(tmp);

		//// Set the states
		this.noValue = (!value);


		//// Bind internal component events
		on(this, 'focusin, focusout, change', 'c-input > input', (evt) => {
			const c_input = this;

			switch (evt.type) {
				case 'focusin':
					c_input.focused = true;
					break;
				case 'focusout':
					c_input.focused = false;
					break;
				case 'change':
					// here we forward the value from the input to this component state value to make srue all get changed.
					this.value = this.inputEl.value;
					break;
			}
		});
	}

	attributeChangedCallback(name: string, oldVal: any, newVal: any) {
		super.attributeChangedCallback(name, oldVal, newVal); // always

		if (this.initialized) {
			switch (name) {
				case 'readonly':
					attr(this.inputEl, { readonly: newVal });
					break;
				case 'disabled':
					attr(this.inputEl, { disabled: newVal });
					break;
				case 'placeholder':
					attr(this.inputEl, { placeholder: newVal });
					break;
			}
		}

	}
}

customElements.define("c-input", InputElement);
