// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/frontends/web/src/web-components/c-input.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { on, frag } from 'mvdom';
import { attr, elem, css } from 'mvdom-xp';
import { BaseFieldElement } from './c-base';


/**
 * c-input custom element encapsulate a label/input field group ()`c-input > label, input`) structure. 
 * component styles are global but scoped via css naming (see c-input.pcss). 
 * 
 * Usage: `<c-input name="fieldNameA" value="value A"></c-input>`
 * See:  http://localhost:8080/_spec/controls
 * 
 * Attributes: 
 *   - See BaseFieldElement.
 *   - `password?`: set input as password
 * 
 * Properties: 
 *   - See BaseFieldElement.
 *   - `password: boolean`: reflective of attribute.
 * 
 * CSS:
 *   - See BaseFieldElement.
 * 
 * Content:
 *   - none
 * 
 * Events:
 *   - `CHANGE` see BaseFieldElement.
 * 
 */

export class InputElement extends BaseFieldElement {

	static get observedAttributes() { return BaseFieldElement.observedAttributes.concat(['password']) }

	//// Component Key Children (on demand for more DOM mutation resiliency)
	labelEl!: HTMLElement;
	inputEl!: HTMLInputElement;

	//// Properties (CSS Reflective)
	get focused(): boolean { return this.classList.contains('focused') };
	set focused(b: boolean) { css(this, { focused: b }) };

	//// Property (Value)
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

		// Note: If the UI call this setter, will always be input value old/new will be always equals.
		//       however, it if is programmatic call, it might be different. so for now, we have to always trigger it. 
		//       TODO: need to find a way to trigger only on change.
		this.triggerChange();
	};

	//#region    ---------- Component Lifecycle Methods ---------- 
	// Component initialization (will be called once by BaseHTMLElement on first connectedCallback)
	init() {
		super.init();
		let [label, value] = attr(this, ['label', 'value']);

		const type = this.hasAttribute('password') ? 'password' : 'text';

		//// Build the component HTML
		const tmp = frag('<label></label><input>');
		[this.labelEl, this.inputEl] = [...tmp.children] as any[]; // because heterogeneous assignment (HTMLInputElement)
		this.labelEl.textContent = label;
		// get the attribute from this c-input to be copied to the input child
		const [readonly, disabled, placeholder] = attr(this, ['readonly', 'disabled', 'placeholder']);
		attr(this.inputEl, { type, value, readonly, disabled, placeholder });
		this.appendChild(tmp); // this will add all of the sibling element of tmp the fastest. 

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

		// TODO: minor bug when user re-click on label when input is empty, it toggle focus off. 
		on(this, 'click', 'label', (evt) => {
			this.inputEl.focus();
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
	//#region    ---------- /Component Lifecycle Methods ---------- 
}

customElements.define("c-input", InputElement);
