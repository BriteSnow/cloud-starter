// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/frontends/web/src/web-components/c-check.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { on } from "mvdom";
import { attr } from "mvdom-xp";
import { BaseFieldElement } from "./c-base";
import { htmlSvgSymbol } from "./c-ico-symbol";

/**
 * c-check custom element encapsulate a checkbox true/false component with NO label concept.
 *
 * Usage: `<c-check name="fieldA" checked></c-input>`
 * See:  SpecControlsView.tmpl, SpecControlsView.ts
 * 
 * Component Attributes:
 *   - name: (optional) see BaseFieldElement.
 *   - value: (optional) See BaseFieldElement.
 *   
 * Component States:
 *   - name: which is a read only (for now) the c-input 'name' attribute
 *   - checked: boolean, itinialized with 'checked' attribute, store as `c-check.on` css class.
 *   - value: can be set to true/false for setting checked, 
 *            or match attribute 'value' (if match true otherwise false), 
 *            returns false if check is off, or true or 'value' attribute value if checked === true
 * 
 */

class CheckElement extends BaseFieldElement {

	//#region    ---------- Component States ---------- 
	get checked() { return this.classList.contains('checked') };
	set checked(v: boolean) {
		const old = this.checked;

		if (v) {
			this.classList.add('checked')
			this.innerHTML = htmlSvgSymbol('ico-check-on');
		} else {
			this.classList.remove('checked')
			this.innerHTML = htmlSvgSymbol('ico-check-off');
		}

		// Best Practce: Trigger the change event in the state setter like this.
		// Note: check if initialized, to avoid trigger data change on initialization
		if (v !== old) {
			this.triggerChange();
		}
	};

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
	//#endregion ---------- /Component States ---------- 


	// Component initialization (will be called once by BaseHTMLElement on first connectedCallback)
	init() {
		super.init(); // just call it for BaseFieldElement sub classes.

		// Note: the HTML content is built on set checked, since it change totally the content. 

		//// Set states
		this.checked = this.hasAttribute('checked');

		//// Bind internal component events
		on(this, 'click', (evt) => {
			this.checked = !this.checked;
		});
	}

}

customElements.define("c-check", CheckElement);