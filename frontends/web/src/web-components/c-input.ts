import { first, on } from "mvdom";
import { attr } from "ts/utils";
import { BaseFieldElement } from "./c-base";


/**
 * c-input custom element encapsulate a label/input field group ()`c-input > label, input`) structure. 
 * component styles are global but scoped via css naming (see c-input.pcss). 
 * 
 * Usage: `<c-input name="fieldNameA" value="value A"></c-input>`
 * See:  SpecControlsView.tmpl, SpecControlsView.ts
 * 
 * Component Attributes: 
 *   - name: (optional) see BaseFieldElement.
 *   - value: (optional) the eventual value initilized value. See BaseFieldElement.
 * 
 * Component States: 
 *   - name: (optional) managed by BaseFieldElement. Read only (for now) the c-input 'name' attribute
 *   - empty: if this input has a value or not, stored as the css `.empty` when empty. 
 *   - value: which is stored in the internal input.value. 
 *       > Note that c-input 'value' attribute is ONLY used to initialize the value as with other html input elements.
 * 
 * Note 1: To minimize state management and out of sync bug with DOM bugs, the values of those states
 *         are stored in the related principal element properties. .empty is the element class !'on', 
 *         .value is stored in the input.value element, and name just from the attribute (needs to make it more ready only)
 * 
 * Note 2: The best practice is to use component attribute s(name=, value=) only as initializers, 
 *         and changing it after the component get rendered has no effect on the component internal state, which 
 *         is the default behavior of my native HTML element (inputs)
 *
 */

export class InputElement extends BaseFieldElement {
	static get observedAttributes() { return ['value']; }

	//// Component Key Children (on demand for more DOM mutation resiliency)
	get inputEl() { return first(this, 'input')! as HTMLInputElement };

	//#region    ---------- Component States ---------- 
	get empty(): boolean { return this.classList.contains('empty') };
	set empty(b: boolean) { (b) ? this.classList.add('empty') : this.classList.remove('empty') };

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
		this.empty = !(newVal && newVal.length > 0);

		// Note that if the UI call this setter, will always be ===
		//      however, it if is programmatic call, it might be different. 
		//      so for now, we have to always trigger it. 
		// TODO: probably need to store the value to a this._prevValue to have correct value
		this.triggerChange();
	};

	get focused(): boolean { return this.classList.contains('focused') };
	set focused(b: boolean) { (b) ? this.classList.add('focused') : this.classList.remove('focused') };
	//#endregion ---------- /Component States ---------- 

	// Component initialization (will be called once by BaseHTMLElement on first connectedCallback)
	init() {
		super.init();

		let [label, value] = attr(this, ['label', 'value']);

		//// Build the component HTML
		label = (label) ? label : "";
		const valueAttr = (value) ? `value="${value}"` : '';
		// create the DOM
		this.innerHTML = `<label>${label}</label>
		<input type="text" ${valueAttr}>`;

		//// Set the states
		if (!value) {
			this.empty = true;
		}

		//// Bind internal component events
		on(this, 'focusin, focusout, change', 'c-input > input', (evt) => {
			const input = evt.selectTarget as HTMLInputElement;
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
}

customElements.define("c-input", InputElement);
