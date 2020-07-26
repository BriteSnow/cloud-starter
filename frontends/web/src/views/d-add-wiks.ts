import { customElement, frag, onEvent, pull, trigger } from 'dom-native';
import { Wks } from 'shared/entities';
import { BaseDialog } from 'views/dialog/d-base-dialog';



@customElement('d-add-wks')
class AddWksDialog extends BaseDialog {

	//#region    ---------- Element Events ---------- 
	@onEvent('OK')
	onOK() {
		const data = pull(this.contentEl) as Partial<Wks>;
		trigger(this, 'ADD_WKS', { detail: data });
	}
	//#endregion ---------- /Element Events ---------- 

	init() {
		super.init();
		this.title = 'Add Workspace';
		this.content = frag('<d-input name="name" label="Workspace Name"></d-input>');
		this.footer = { ok: 'Add Workspace', cancel: true };
	}

}