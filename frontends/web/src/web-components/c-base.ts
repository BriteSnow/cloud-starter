

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

	/** 
	 * Methods to override to create child elements. Will be called only once.
	 * 
	 * Note 1: Do not call this method your code, should be called only by BaseHTMLElement
	 * Note 2: If sub component overrides `connectedCallback()` make sure to call `super.connectedCallback()`
	 */
	abstract init(): void;

	/**
	 * If override this method, make sure to call `super.connectedCallback()`;
	 */
	connectedCallback() {
		if (!this._init) {
			this.init();
			this._init = true;
		}
	}

}