import { css } from 'common/dom-utils';
import { customElement, elem, first, onEvent, pull, trigger } from 'dom-native';
import { DgDialog } from './popup/dg-dialog';
const { assign } = Object;




@customElement('dg-wks-add')
export class DgWksAdd extends DgDialog {

	constructor() {
		super();

		// add extra sub component style
		_compStyle ??= Object.assign(elem('style'), { innerHTML: _compCss });
		this.shadowRoot?.append(_compStyle.cloneNode(true));
	}

	@onEvent('pointerup', '.do-ok')
	doOk() {
		super.doOk();
		const detail = pull(this);
		trigger(this, 'WKS_ADD', { detail });
	}


	init() {
		// add the content to be slotted
		this.innerHTML = `
			<div slot="title">Add Workspace</div>

			<div class="dialog-content">
				<d-input label="name" name="name"> </d-input>
			</div>
			
			<button slot="footer" class="do-cancel">CANCEL</button>
			<button slot="footer" class="do-ok medium">OK</button>
		`;
	}

	postDisplay() {
		first(this, 'd-input')?.focus();
	}
}


let _compStyle: HTMLElement | undefined;
const _compCss = css`
	::slotted(.dialog-content) {
		display: grid;
		grid-auto-flow: row;
		grid-auto-rows: min-content; 
		grid-gap: 1rem;
	}
`