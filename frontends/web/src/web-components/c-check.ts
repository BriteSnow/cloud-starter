import { attr, htmlIco } from "ts/utils";
import { on } from "mvdom";

class CheckElement extends HTMLElement {

	get value(): 'true' | 'false' {
		const checkOn = this.classList.contains('on');
		return (checkOn) ? 'true' : 'false';
	}

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

	constructor() {
		super();
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




