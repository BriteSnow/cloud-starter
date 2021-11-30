import { adoptStyleSheets, css, customElement, first, onEvent, pull, trigger } from 'dom-native';
import { DgDialog } from '../dialog/dg-dialog.js';
const { assign } = Object;


const _compCss = css`
	::slotted(.dialog-content) {
		display: grid;
		grid-auto-flow: row;
		grid-auto-rows: min-content; 
		grid-gap: 1rem;
	}
`;


@customElement('dg-wks-add')
export class DgWksAdd extends DgDialog {

	constructor() {
		super();
		adoptStyleSheets(this, _compCss);
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
			<div slot="title">Add Workspace!!</div>

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

