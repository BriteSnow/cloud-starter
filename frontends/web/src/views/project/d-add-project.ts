import { customElement, frag, onEvent, pull, trigger } from 'dom-native';
import { Project } from 'shared/entities';
import { BaseDialog } from 'views/dialog/d-base-dialog';



@customElement('d-add-project')
class AddProjectDialog extends BaseDialog {

	//#region    ---------- Element Events ---------- 
	@onEvent('OK')
	onOK() {
		const data = pull(this.contentEl) as Partial<Project>;
		console.log('->>> ', data);
		trigger(this, 'ADD_PROJECT', { detail: data });
	}
	//#endregion ---------- /Element Events ---------- 

	init() {
		super.init();
		this.title = 'Add Project';
		this.content = frag('<d-input name="name" label="Project Name"></d-input>');
		this.footer = { ok: 'Add Project', cancel: true };
	}

}