import { on, frag, first, pusher, puller } from "mvdom";
import { attr } from "ts/utils";
import { BaseHTMLElement } from "./c-base";


/**
 * c-input custom element abstract the input field `c-input > label, input` structure and styling. 
 * component styles are global but scoped via css naming (see c-input.pcss). 
 * 
 * Note 1: This component has a binding performance optimization that bind the input focusin/focusout/change on document
 *         via delegate rather than on each c-input element. 
 * 
 * This component maintains three state, and to minimize state management, we use native DOM to store those state appropriately.
 *   - empty: which is stored as the css c-input.on. 
 *   - value: which is stored in property input.value. Not at c-input 'value' attribute is just here to initialize the input.value.
 *   - name: which is a read only (for now) storedas the c-input 'name' attribute
 * 
 * See at the end of file for the mvdom puller/pusher
 */

//#region    ---------- c-input ----------

export class InputElement extends BaseHTMLElement {
	static get observedAttributes() { return ['value']; }

	//// Component Key Children (on demand for more DOM mutation resiliency)
	get inputEl() { return first(this, 'input')! as HTMLInputElement };

	//#region    ---------- Component States ---------- 
	// name is read only (for now)
	get name() { return attr(this, 'name') };


	get empty() { return this.classList.contains('empty') };
	set empty(b: boolean) { (b) ? this.classList.add('empty') : this.classList.remove('empty') };

	get value() { return this.inputEl.value };
	set value(val: any) {
		this.inputEl.value = val;
		// get the value from input so that we use the html input parsing behavior
		const newVal = this.value;
		// update the empty state
		this.empty = !(newVal && newVal.length > 0);
	};

	get focused() { return this.classList.contains('focused') };
	set focused(b: boolean) { (b) ? this.classList.add('focused') : this.classList.remove('focused') };
	//#endregion ---------- /Component States ---------- 

	// Component initialization (will be called once by BaseHTMLElement on first connectedCallback)
	init() {
		let [label, name, value] = attr(this, ['label', 'name', 'value']);

		label = (label) ? label : "";
		const valueAttr = (value) ? `value="${value}"` : '';
		const nameAttr = (name) ? `name="${name}"` : '';

		this.innerHTML = `<label>${label}</label>
		<input type="text" ${valueAttr} ${nameAttr}>`;

		if (!value) {
			this.empty = true;
		}
	}
}

customElements.define("c-input", InputElement);

//#endregion ---------- /c-input ----------

//// Performance Optimization. Delegate bindings to add the necessary component behavior for the HTMLInputElement contained in the custom InputElement (c-input) element.

// Note 1: Doing those bindings at the document root, allows to have it done once for the whole application, rather than once per component instantiation. 
//       Technically, those binding could be done in the c-input.init, by just doing `on(this, 'focusin, focusout, change', 'input', (evt) => ...)`

// Note 2: This optitmization is made possible because the shadowDOM is not use in our way to use web components. 

on(document, 'focusin, focusout, change', 'c-input > input', (evt) => {
	const input = evt.selectTarget as HTMLInputElement;
	const c_input = input.parentElement as InputElement;

	switch (evt.type) {
		case 'focusin':
			c_input.focused = true;
			break;
		case 'focusout':
			c_input.focused = false;
			break;
		case 'change':
			// using `input.value` as small optimization to avoid calling c_input.value which does a on demand input selector
			c_input.value = input.value;
			break;
	}
})


//#region    ---------- Register mvdom dx ---------- 
pusher('c-input', function (this: InputElement, val: any) {
	this.value = val;
});
puller('c-input', function (this: InputElement) {
	return this.value;
});
//#endregion ---------- /Register mvdom dx ----------
