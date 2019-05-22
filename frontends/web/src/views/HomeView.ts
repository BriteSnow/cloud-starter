import { BaseView, addDomEvents, addHubEvents } from './base';
import { DialogBase } from './Dialog/DialogBase';
import { frag, display, pull, on } from 'mvdom';
import { render } from 'ts/render';
import { projectDco } from 'ts/dcos';
import { attrAsNum } from 'ts/utils';
import { ProjectAddDialog } from './Project/ProjectAddDialog';



export class HomeView extends BaseView {

	events = addDomEvents(this.events, {

		'click; .project-add': async (evt) => {
			const dialog = new ProjectAddDialog();
			display(dialog, 'body');
			dialog.onAdd((project) => {
				projectDco.create(project);
			})
		}

	});

	//#region    ---------- Hub Events ----------
	hubEvents = addHubEvents(this.hubEvents, {
		// 'routeHub' is the hub receiving url changes
		'dcoHum; project; create, update': async (evt) => {
			const projects = await projectDco.list();
			console.log('>>> new projects', projects);
			// this.refreshUI()
		}
	});
	//#endregion ---------- /Hub Events ----------
}