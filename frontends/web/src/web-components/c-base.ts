// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/frontends/web/src/web-components/c-base.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { puller, pusher, trigger } from "mvdom";
import { attr, css } from "mvdom-xp";

// component unique sequence number to allow to have cheap UID for each component
let c_seq = 0;

/**
 * BaseHTMLElement that all custom elements from this application should inherit from. 
 * 
 * 
 * Then, in sub component. 
 * - Implement the `init()` to set the innerHTML or append children element (it will be called only once)
 * - If `connectedCallback()` implemented in sub component, make sure to call `super.connectedCallback()` to have the init logic. 
 * - Never call `init()` from anywhere. Only `BaseHTMLElement.connectedCallback()` implementation should call `init()`
 * 
 */
export abstract class BaseHTMLElement extends HTMLElement {
	// unique sequenceId number for each instance. 
	readonly uid: string;

	private _init = false;
	protected get initialized() { return this._init }

	constructor() {
		super();
		this.uid = 'c_uid_' + c_seq++;
	}

	/** 
	 * Method to override to create child elements. Will be called only once by the BaseHTMLElement `connectedCallback()` implementation.
	 * 
	 * As best practice, sub class must called `super.init()` first thing when overriding the `init()` methods. 
	 * 
	 * Note 1: Do not call this method your code, should be called only by BaseHTMLElement
	 * Note 2: If sub component overrides `connectedCallback()` make sure to call `super.connectedCallback()`
	 */
	init(): void { };

	/**
	 * Base implementation of `connectedCallback` that will call `this.init()` once. 
	 * 
	 * If override this method, make sure to call `super.connectedCallback()`;
	 */
	connectedCallback() {
		if (!this._init) {
			this.init();
			this._init = true;
		}
	}

	/**
	 * Empty implementation to allow `super.disconnectedCallback()` best practices on sub classes
	 */
	disconnectedCallback() { }

	/**
	 * Empty implement to allow `super.` best practices on sub classes.
	 */
	attributeChangedCallback(attrName: string, oldVal: any, newVal: any) { }

}


/**
 * Base component for any Field base custom component that provide a `.value` `.name` interface.
 * This will also automatically set the component as css class `dx` if it has a name, 
 * so that by default they pushed/pulled by `mvdom push/pull` system.
 * 
 * Component Attributes:
 *   - `readonly`: set the component as readonly.
 *   - `disabled`: set the component as disabled.
 *   - `name?`: reflective of 'name' property. If absent, `.no-name` css class.
 *   - `label?`: if absent, this css `.no-label` will be set.
 *   - `value?`: this is the initial value of the component. TODO: needs to unify when no value (right now .empty for input, .no-value for c-select)
 *   - `placeholder?`: placeholder text.
 * 
 * Component Properties: 
 *   - `readonly: boolean`: reflective of attribute.
 * 	 - `disabled: boolean`: reflective of attribute.
 *   - `noValue: boolean`: reflective of css `no-value`.
 *   - `name?: string`: reflective of attribute.
 *   - `placeholder?: string`: 
 *   - `label?: string`: Manged by subClass.
 *   - `value?: any`: field value. Managed by subClass. (reflection undefined).
 *
 * Component Events:
 *   - `CHANGE` Sub Class call `triggerChange()` which will trigger a `evt.detail: {name: string, value: string}`.
 * 
 * Component CSS: 
 *  - `.no-value` when the field has no value (for now, managed by sub class)
 *  - `.no-label` when teh field has no label.
 *  - `.dx` will be added when field component has a name.
 * 
 * Sub class MUST
 * - Sub classes MUST call `super.init()` in their `init()` implementation.
 * 
 */
export class BaseFieldElement extends BaseHTMLElement {

	static get observedAttributes(): string[] { return ['disabled', 'readonly', 'placeholder']; }

	//// BaseField states
	value: any; // needs to be implemented by subclass

	//// Attribute Reflective Properties
	get readonly(): boolean { return this.hasAttribute('readonly') };
	set readonly(v: boolean) { attr(this, 'readonly', (v) ? '' : null) };

	get disabled(): boolean { return this.hasAttribute('disabled') };
	set disabled(v: boolean) { attr(this, 'disabled', (v) ? '' : null) };

	get name() { return attr(this, 'name') };
	set name(v: string | null) { attr(this, 'name', v) };

	get placeholder() { return attr(this, 'placeholder') };
	set placeholder(v: string | null) { attr(this, 'placeholder', v) };

	//// CSS Reflective Properties
	get noValue() { return this.classList.contains('no-value') };
	set noValue(v: boolean) { css(this, { 'no-value': v }) };

	init() {
		super.init(); // best practice, even if it in this case, the parent.init() is blank. 

		const [name, label] = attr(this, ['name', 'label']);

		if (!label) {
			this.classList.add('no-label');
		}

		// by default if we have a 'name' attribute we add 
		//   - The '.dx' to allow seamless mvdom push/pull
		//   - The '.c-field' which specifies that this component has name/value so that
		//     we can use the same `mvdom` pusher/puller for all
		if (name && name.length > 0) {
			this.classList.add('dx', 'c-field');
		}
	}

	triggerChange() {
		// Will trigger only if the component has been initialized
		if (this.initialized) {
			const value = this.value;
			const name = this.name;
			trigger(this, "CHANGE", { detail: { name, value } });
		}
	}
	// Called when an observed attribute has been added, removed, updated, or replaced
	attributeChangedCallback(attrName: string, oldVal: any, newVal: any) {
		super.attributeChangedCallback(attrName, oldVal, newVal); // always

		switch (attrName) {
			case 'readonly':
				break;
			case 'disabled':
				break;
		}
	}
}

//#region    ---------- Register mvdom dx ---------- 
pusher('.c-field', function (this: BaseFieldElement, val: any) {
	this.value = val;
});
puller('.c-field', function (this: BaseFieldElement) {
	return this.value;
});
//#endregion ---------- /Register mvdom dx ----------
