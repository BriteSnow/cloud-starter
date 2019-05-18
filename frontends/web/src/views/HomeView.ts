import { BaseView, addDomEvents } from './base';
import { DialogBase } from './Dialog/DialogBase';
import { frag, display } from 'mvdom';
import { render } from 'ts/render';



export class HomeView extends BaseView {

	events = addDomEvents(this.events, {

		'click': async (evt) => {
			const dialog = new DialogBase();
			dialog.title = 'Add Project';
			dialog.content = render('ProjectAddDialog-content');
			dialog.footer = { ok: 'Add Project', cancel: true };

			await display(dialog, 'body');
		}

	});
}