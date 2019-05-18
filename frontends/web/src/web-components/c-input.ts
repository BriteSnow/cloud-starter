import { on, frag } from "mvdom";
import { attr } from "ts/utils";


//#region    ---------- c-input ---------- 
class InputElement extends HTMLElement {
	label?: string;

	constructor() {
		super();
		const [label, value] = attr(this, ['label', 'value']);

		this.label = (label) ? label : "";
		const empty = (value) ? false : true;
		const valueAttr = (!empty) ? `value="${value}"` : '';

		if (empty) {
			this.classList.add('empty');
		}

		this.innerHTML = `<label>${label}</label>
		<input type="text" ${valueAttr}>`;

	}
}

customElements.define("c-input", InputElement);
//#endregion ---------- /c-input ----------

/// Delegate bindings to add the necessary behavior for the HTMLInputElement contained in the custom InputElement (c-input) element.
///   Note: Doing those bindings once for all instance reduces the number of binding necesary, 
///         but technically, those binding could be done in the c-input element as well, as in other web components in this project. 

// on focusin, add the eventual parent .focus class
on(document, 'focusin', 'input', (evt) => {
	const input = evt.selectTarget;
	const parent = input.parentElement;
	if (parent && parent.tagName === 'C-INPUT') {
		parent.classList.add('focus');
	}
});

// on focusout, remove the eventual parent .focus class
on(document, 'focusout', 'input', (evt) => {
	const input = evt.selectTarget;
	const parent = input.parentElement;
	if (parent && parent.tagName === 'C-INPUT') {
		parent.classList.remove('focus');
	}
});

// keep the field state in sync with content
on(document, 'change', 'input', (evt) => {
	const input = evt.selectTarget as HTMLInputElement;
	const parent = input.parentElement;
	if (parent && parent.tagName === 'C-INPUT') {
		if (input.value.length > 0) {
			parent.classList.remove('empty');
		}
		else {
			parent.classList.add('empty');
		}
	}
});


