// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-bigapp/master/frontends/web/src/web-components/c-select.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { BaseFieldElement } from '@dom-native/ui';
import { all, attr, first, frag, off, on, style, trigger } from 'dom-native';

/**
 * c-select is a select component.
 *
 * Usage: `<c-select name="fieldA" value="0"><option value="0">Item 0</option></c-select>`
 * See:  http://localhost:8080/_spec/controls
 * 
 * Attributes:
 *   - See BaseFieldElement.
 * 
 * Properties:
 *   - See BaseFieldElement.
 *   - `options: Option[]` The list of options object for this field. Can be initialized with HTML content or with the DATA API.
 * 
 * CSS:
 *   - See BaseFieldElement.
 * 
 * Content (NOT reflective, just for initialization)
 *   - List of `<option value="1">Value 1</option>` (value must be unique, one can be non present, which === null)
 *   - or shorthand for one option `<c-select value="1">Value One</c-select>` will create one `<option` with this value/content
 *   - or shorhand for place holder `<c-select>Select User</c-select>` same as `<c-select placeholder="Select User"></c-select>`
 * 
 * Events:
 *   - `CHANGE` see BaseFieldElement.
 *   - `DATA` with `evt.detail: {sendData: (options: Option[]) => void}` that provide a data callback when the component needs the data.
 * 
 */
type Option = { content: string, value: string | null };

class SelectElement extends BaseFieldElement {
	labelEl: any;

	static get observedAttributes() { return BaseFieldElement.observedAttributes.concat(); }

	//// Key Elements
	contentEl!: HTMLElement;

	//// Properties
	options: Option[] = [];

	//// Property (Value)
	get value() {
		return this.getAttribute('value');
	}
	set value(v: string | null) {
		attr(this, 'value', v);
		this.refresh();
	}

	//#region    ---------- Component Events ----------
	triggerData(sendData: (options: Option[]) => void) {
		trigger(this, 'DATA', { detail: { sendData } });
	}
	//#endregion ---------- /Component Events ---------- 


	//#region    ---------- Lifecycle ---------- 

	// Component initialization (will be called once by BaseHTMLElement on first connectedCallback)
	init() {

		super.init(); // just call it for BaseFieldElement sub classes.
		const [label, value] = attr(this, ['label', 'value']);

		//// create the appropriate this.options list from content HTML
		const firstElement = this.firstElementChild;
		let content: string | null = null;
		// if we have options, then, we create the list
		if (firstElement && firstElement.tagName === "OPTION") {
			this.options = all(this, 'option').map(option => { return { content: option.innerHTML, value: option.getAttribute('value') } });
		}
		// if the content is not <option>, then, assume it shorthands for 
		//   - placeholder (if no value)
		//   - the content of the only option of the value (if value)
		else {
			content = (firstElement) ? firstElement.textContent : (this.firstChild) ? this.firstChild.textContent : null;
			if (content) {
				// if we have a value, then, create the single options with this value and content.
				if (value != null) {
					this.options.push({ value, content });
				}
				// otherwise, we set the place holder with the content
				else {
					this.placeholder = content;
				}
			}
		}

		//// Create Content
		let tmp = frag(`<label></label><div></div><c-ico>chevron-down</c-ico>`);
		[this.labelEl, this.contentEl] = [...tmp.children] as HTMLElement[];
		this.labelEl.textContent = label;
		this.innerHTML = ''; // to remove
		this.appendChild(tmp);

		//// Refresh the content
		this.refresh();

		//// Bind internal component events
		on(this, 'click', (evt) => {
			if (!this.disabled && !this.readonly) {
				let popupFrag = frag('<c-select-popup></c-select-popup>').firstElementChild as SelectPopupElement;
				popupFrag._options = this.options;
				popupFrag._select = this;

				// Append it to the body.
				// Note: SelectPopupElement constructor get called as it get appended to document)
				const popup = first('body')!.appendChild(popupFrag);

				// listen the popup if select occurs
				on(popup, 'SELECT', (evt) => {
					this.value = evt.detail.value;
					this.triggerChange();
					this.refresh();
				});

				// trigger a data event if a listener wants to provide data
				this.triggerData((options: Option[]) => {
					this.options = options; // TODO: probably needs to have popup just asking select for options[]
					popup.options = options;
				});
			}

		});
	}
	//#endregion ---------- /Lifecycle ---------- 

	refresh() {
		const val = this.value;
		const placeholder = this.placeholder;
		const option = this.options.find(o => (o.value === val));

		if ((option == null || option.value == null) && placeholder != null) {
			this.contentEl.textContent = placeholder;
		} else if (option) {
			this.contentEl.innerHTML = option.content;
		}

		this.noValue = (val == null);
	}
}

customElements.define("c-select", SelectElement);


//#region    ---------- SelectPopupElement ---------- 
/**
 * Component to be used only by the SelectElement (for now).
 */
class SelectPopupElement extends BaseFieldElement {
	get value(): any {
		throw new Error('Method not implemented.');
	}
	set value(val: any) {
		throw new Error('Method not implemented.');
	}
	_options!: Option[];
	_select!: SelectElement;

	//// Properties
	get options() { return this._options };
	set options(val: Option[]) {
		this._options = val;
		if (this.initialized) {
			this.render();
		}
	}

	//#region    ---------- Lifecycle ---------- 
	init() {
		super.init();

		this.render();

		// position the popup
		// FIXME: Need to handle when scroll
		const emRect = this._select.getBoundingClientRect();
		style(this, {
			top: emRect.top + emRect.height + 4 + 'px',
			left: emRect.left + 'px',
			width: emRect.width + 'px'
		});

		// events
		on(this, 'click', 'li', (evt) => {
			const li = evt.selectTarget;
			const value = attr(li, 'data-val');
			trigger(this, 'SELECT', { detail: { value } })
			this.remove();
		});

		// TRICK: put on a timeout to get the event only after display, otherwise we get the click even when the 
		//        user click on the c-select. 
		//        TODO: might need to find a more elegant way.
		// IMPORTANT: MUST be unbound in the disconnectedCallback
		setTimeout(() => {
			on(document, 'click', (evt) => {
				// TODO 
				const target = evt.target as HTMLElement;
				if (target.closest('c-select-popup') !== this) {
					this.remove();
				}

			}, { ns: this.uid });

		}, 10)

	}

	// IMPORTANT: unregister parent DOM event bindings in the disconnectedCallback
	disconnectedCallback() {
		super.disconnectedCallback(); // ALWAYS
		off(document, { ns: this.uid });
	}

	//#region ---------- /Lifecycle ---------- 


	render() {
		const selectVal = this._select.value;
		let html = `\n<ul>`;
		for (const item of this._options) {
			const attrCss = (item.value === selectVal) ? 'class="sel"' : '';
			const attrVal = (item.value) ? `data-val="${item.value}"` : '';
			html += `\n  <li ${attrVal} ${attrCss}>${item.content}</li>`;
		}
		html += `\n</ul>`;
		this.innerHTML = html;
	}

}
customElements.define("c-select-popup", SelectPopupElement);

//#endregion ---------- /SelectPopupElement ----------
