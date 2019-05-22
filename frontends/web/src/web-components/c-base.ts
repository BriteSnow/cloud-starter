/// source: ....

import { puller, pusher, trigger } from "mvdom";
import { attr } from "ts/utils";



/**
 * BaseHTMLElement that all custom elements from this application should inherit from. 
 * 
 * Then, in sub component. 
 * - Implement the `init()` to set the innerHTML or append children element (it will be called only once)
 * - If `connectedCallback()` implemented in sub component, make sure to call `super.connectedCallback()` to have the init logic. 
 * - Never call `init()` from anywhere. Only `BaseHTMLElement.connectedCallback()` implementation should call `init()`
 * 
 */
export abstract class BaseHTMLElement extends HTMLElement {

	private _init = false;
	protected get initialized() { return this._init }

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

}


/**
 * Base component for any Field base custom component that provide a `.value` `.name` interface.
 * This will also automatically set the component as css class `dx` if it has a name, 
 * so that by default they pushed/pulled by `mvdom push/pull` system.
 * 
 * Component Attributes:
 *   - name: (optional) if set, it will set this field a mvdom dx component. 
 *   - value: (optional) this is the initial value of the component. Attribute Value will NOT be change with state 'value'.
 * 
 * Sub class MUST
 * - Sub classes MUST call `super.init()` in their `init()` implementation.
 * 
 */
export class BaseFieldElement extends BaseHTMLElement {

	//// BaseField states
	get name() { return attr(this, 'name') };
	value: any;

	init() {
		super.init(); // best practice, even if it in this case, the parent.init() is blank. 

		const name = attr(this, 'name');

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
}

//#region    ---------- Register mvdom dx ---------- 
pusher('.c-field', function (this: BaseFieldElement, val: any) {
	this.value = val;
});
puller('.c-field', function (this: BaseFieldElement) {
	return this.value;
});
//#endregion ---------- /Register mvdom dx ----------
