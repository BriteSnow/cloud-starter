import { attr, htmlIco } from "ts/utils";
import { on } from "mvdom";
import { BaseHTMLElement } from "./c-base";

class CheckElement extends BaseHTMLElement {

	//#region    ---------- Component States ---------- 
	get name() { return attr(this, 'name') };

	get value() { return (this.classList.contains('on')) ? 'true' : 'false'; }
	set value(v: 'true' | 'false') {
		if (v === 'true') {
			this.classList.add('on');
			this.setAttribute('value', 'true');
			this.innerHTML = htmlIco('check-on');
		} else {
			this.classList.remove('on');
			this.setAttribute('value', 'false');
			this.innerHTML = htmlIco('check-off');
		}
	}
	//#endregion ---------- /Component States ---------- 


	// Component initialization (will be called once by BaseHTMLElement on first connectedCallback)
	init() {
		const [label, value] = attr(this, ['label', 'value']);
		const val = (value === 'true') ? 'true' : 'false';
		this.value = val;

		on(this, 'click', (evt) => {
			// we get and toggle the value
			const newVal = (this.value === 'true') ? 'false' : 'true';
			// we set the new value
			this.value = newVal;
		});
	}

}

customElements.define("c-check", CheckElement);


// TODO: needs to impement the mvdom dx puller/pusher