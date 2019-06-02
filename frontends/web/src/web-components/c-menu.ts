// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/frontends/web/src/web-components/c-menu.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { BaseFieldElement } from "./c-base";
import { style, attr } from "mvdom-xp";
import { on, trigger, off } from "mvdom";

type Item = { value: string, content: string };

///// NOT IMPLEMENTED YET

class MenuElement extends BaseFieldElement {
	_refEl!: HTMLElement;
	_items?: Item[];
	_value: string | null = null;

	get items() { return this._items };

	set items(items: Item[] | undefined) {
		this._items = items;
		if (this.initialized) {
			this.render();
		}
	}

	init() {
		super.init();

		this.render();

		// position the popup
		// TODO: Need to handle when scroll
		const emRect = this._refEl.getBoundingClientRect();
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

	public update(items: Item[], value?: string | null) {
		this._items = items;
		if (value !== undefined) {
			this._value = value;
		}
	}

	private render() {
		if (this._items == null) {
			return; // for now do nothing
		}
		const selectVal = this._value;
		let html = `\n<ul>`;
		for (const item of this._items) {
			const attrCss = (item.value === selectVal) ? 'class="sel"' : '';
			const attrVal = (item.value) ? `data-val="${item.value}"` : '';
			html += `\n  <li ${attrVal} ${attrCss}>${item.content}</li>`;
		}
		html += `\n</ul>`;
		this.innerHTML = html;
	}



	// IMPORTANT: unregister parent DOM event bindings in the disconnectedCallback
	disconnectedCallback() {
		super.disconnectedCallback(); // ALWAYS
		off(document, { ns: this.uid });
	}
}
customElements.define("c-menu", MenuElement);