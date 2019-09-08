import { customElement, frag, onEvent, pull, trigger } from 'mvdom';
import { Project } from 'shared/entities';
import { BaseDialog } from 'views/dialog/d-base-dialog';



@customElement('d-add-project')
class AddProjectDialog extends BaseDialog {

	//#region    ---------- Element Events ---------- 
	@onEvent('OK')
	onOK() {
		const data = pull(this.contentEl) as Partial<Project>;
		trigger(this, 'ADD_PROJECT', { detail: data });
	}
	//#endregion ---------- /Element Events ---------- 

	init() {
		super.init();
		this.title = 'Add Project';
		this.content = frag('<c-input name="name" label="Project Name"></c-input>');
		this.footer = { ok: 'Add Project', cancel: true };
	}

}