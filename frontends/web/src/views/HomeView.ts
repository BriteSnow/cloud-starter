import { BaseView, addDomEvents, addHubEvents } from './base';
import { DialogBase } from './Dialog/DialogBase';
import { frag, display, pull } from 'mvdom';
import { render } from 'ts/render';
import { projectDco } from 'ts/dcos';
import { attrAsNum } from 'ts/utils';



export class HomeView extends BaseView {

	events = addDomEvents(this.events, {

		'click; .project-add': async (evt) => {
			const dialog = new DialogBase();
			dialog.title = 'Add Project';
			dialog.content = render('ProjectAddDialog-content');
			dialog.footer = { ok: 'Add Project', cancel: true };
			await display(dialog, 'body');
		},

		'click; .project': async (evt) => {
			const projectId = attrAsNum(evt.selectTarget, 'data-id')!;
			projectDco.remove(projectId);
		}

	});

	//#region    ---------- Hub Events ----------
	hubEvents = addHubEvents(this.hubEvents, {
		// 'routeHub' is the hub receiving url changes
		'dcoHum; project; create, update': async (evt) => {
			const projects = await projectDco.list();
			// this.refreshUI()
		}
	});
	//#endregion ---------- /Hub Events ----------
}