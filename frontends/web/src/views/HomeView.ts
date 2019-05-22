import { display, first } from 'mvdom';
import { projectDco } from 'ts/dcos';
import { addDomEvents, addHubEvents, BaseView } from './base';
import { ProjectAddDialog } from './Project/ProjectAddDialog';
import { all } from 'mvdom';
import { render } from 'ts/render';



export class HomeView extends BaseView {

	//// Key Elements
	get content() { return first(this.el, '.HomeView > section')! }

	//#region    ---------- DOM Events ----------
	events = addDomEvents(this.events, {

		'click; .project-add': async (evt) => {
			const dialog = new ProjectAddDialog();
			display(dialog, 'body');
			dialog.onAdd((project) => {
				projectDco.create(project);
			})
		}

	});
	//#region    ---------- DOM Events ----------

	//#region    ---------- Hub Events ----------
	hubEvents = addHubEvents(this.hubEvents, {
		// 'routeHub' is the hub receiving url changes
		'dcoHub; Project; create, update': async (evt) => {
			this.refreshUI();
		}
	});
	//#endregion ---------- /Hub Events ----------

	async postDisplay() {
		this.refreshUI();
	}

	private async refreshUI() {
		// Note: for now not optimized. 
		all(this.content, '.card.project').forEach(cardEl => cardEl.remove());
		const projects = await projectDco.list();
		const projectsFrag = render('HomeView-project-cards', { projects });
		this.content.appendChild(projectsFrag);
	}
}