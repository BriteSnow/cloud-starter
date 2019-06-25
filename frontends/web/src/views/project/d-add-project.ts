import { BaseDialog } from 'views/dialog/d-base-dialog';
import { frag, pull, trigger } from 'mvdom';
import { onEvent, customElement } from 'mvdom-xp';
import { Project } from 'shared/entities';



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