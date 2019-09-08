// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/frontends/web/src/web-components/c-check.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { on, attr } from 'mvdom';
import { BaseFieldElement } from 'mvdom-xp';
import { htmlSvgSymbol } from './c-ico-symbol';

/**
 * c-check custom element encapsulate a checkbox true/false component with NO label concept.
 *
 * Usage: `<c-check name="fieldA" checked></c-input>`
 * See:  http://localhost:8080/_spec/controls
 * 
 * Attributes:
 *   - See BaseFieldElement.
 *   - `value?`: value of the component.
 *   - `checked?`: checked states of te component.
 *   
 * Properties:
 *   - See BaseFieldElement.
 *   - `value`: If checkbox checked true or 'value' attribute if present, otherwise, if not checked false.
 *   - `checked: boolean`: reflective of Attribute.
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

class CheckElement extends BaseFieldElement {

	static get observedAttributes() { return BaseFieldElement.observedAttributes.concat(['checked']) }

	//// Properties (Attribute Reflective)
	get checked() { return this.hasAttribute('checked') }
	set checked(v: boolean) { attr(this, { checked: v }) }

	//// Property (Value)
	get value() {
		const attrValue = attr(this, 'value');
		const checked = this.checked;
		// if we have a attribute value return it 
		if (attrValue) {
			return (checked) ? attrValue : false; // could have return undefined rather than false, but decide to always return a value.
		}
		else {
			return checked;
		}
	}
	set value(v: any) {
		// if it is a boolean, then, just pass the value
		if (typeof v === 'boolean') {
			this.checked = v;
		}
		// otherwise, we assume we have attr
		else {
			const attrValue = attr(this, 'value');
			if (attrValue) {
				this.checked = (attrValue === v);
			}
			// Should not be in this state, we log for the component user to fix issue.
			else {
				console.log(`Warning - c-check - Tries to set a non boolean value '${v}' to checkElement.value which do not have a attribute value to match with. Skipping. `);
			}
		}
	}


	//#region    ---------- Lifecycle ---------- 
	// Component initialization (will be called once by BaseHTMLElement on first connectedCallback)
	init() {
		super.init(); // just call it for BaseFieldElement sub classes.

		this.refresh();

		//// Bind internal component events
		on(this, 'click', (evt) => {
			this.checked = !this.checked;
		});
	}

	attributeChangedCallback(name: string, oldVal: any, newVal: any) {
		super.attributeChangedCallback(name, oldVal, newVal); // always

		if (this.initialized) {
			switch (name) {
				case 'checked':
					if (oldVal !== newVal) {
						this.refresh();
						this.triggerChange();
					}
					break;
			}
		}

	}
	//#endregion ---------- /Lifecycle ---------- 

	refresh() {
		if (this.checked) {
			this.innerHTML = htmlSvgSymbol('ico-check-on');
		} else {
			this.innerHTML = htmlSvgSymbol('ico-check-off');
		}
	}
}

customElements.define("c-check", CheckElement);