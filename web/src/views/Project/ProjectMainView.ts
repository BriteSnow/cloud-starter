import { all, append, display, empty, first } from 'mvdom';
import { projectDso } from 'ts/dsos';
import { sync } from 'ts/gh-api';
import { render } from 'ts/render';
import { pathAsNum } from 'ts/route';
import { addDomEvents, addHubEvents, BaseView } from 'views/base';
import { ProjectListMainView } from './ProjectListMainView';
import { ProjectTicketsMainView } from './ProjectTicketsMainView';

// TIP: Simple but Effective Module Scoped UI State
//    We start with the "tickets" as the default tab, but then, it get updated as the user change tabs.
//    This is a very simple but effective way to keep the tab selected when changing project (simple but effective UI state). 
let defaultTab = 'lists';

export class ProjectMainView extends BaseView {
	projectId?: number;

	//// View key dom elements
	private get header() { return first(this.el, '.screen header')! }
	private get content() { return first(this.el, '.screen > section')! }

	//// View state
	private get mode() {
		const a = first(this.header, `.tab-bar a.sel`);
		return (a) ? getLastHrefPath(a) : null;
	}

	private set mode(m: string | null) {
		const elems = all(this.header, '.tab-bar a');
		for (const elem of elems) {
			const lastPath = getLastHrefPath(elem);
			if (m === lastPath) {
				elem.classList.add('sel');
			} else {
				elem.classList.remove('sel');
			}
		}
	}

	//#region    ---------- View DOM Events ---------- 
	events = addDomEvents(this.events, {
		'click; .do-sync': async (evt) => {
			const ids = await sync(this.projectId!);
			console.log(`Project ${this.projectId!} issues synced`, ids);
		}
	});
	//#endregion ---------- /View DOM Events ---------- 


	//#region    ---------- Hub Events ----------
	hubEvents = addHubEvents(this.hubEvents, {
		// 'routeHub' is the hub receiving url changes
		'routeHub; CHANGE': () => {
			this.refresh();
		}
	});
	//#endregion ---------- /Hub Events ---------- 

	//#region    ---------- View Controller Methods ---------- 
	async postDisplay(data: any) {
		this.refresh();
	}
	//#endregion ---------- /View Controller Methods ---------- 

	private async refresh() {
		// Make sure this view is still displayed (after rem)
		// TODO: Might want to do it in the mvdom, to deregister early on remove
		if (!this.el.parentElement) {
			console.log(`TODO: need to check with mvdom how we can avoid this check`);
			return;
		}

		const id = pathAsNum(1);


		// first, we change the main project header if the project change
		const newProjectId = this.hasNewPathAt(1, '' + id);

		if (newProjectId != null) {

			this.projectId = id!;
			this.el.setAttribute('data-entity-id', `${id}`);
			// get the project
			const project = await projectDso.get(id!);

			// refresh the header
			append(this.header, render('ProjectMainView-header', project), 'empty');

			// reset the newPath for the tab index (no matter what we want to refresh it)
			this.resetNewPathAt(2);
		}

		// if new path
		const newTab = this.hasNewPathAt(2, defaultTab);
		if (newTab) {
			defaultTab = newTab; // we change the default, see Simple but Effective UI State TIP above
			this.mode = newTab;

			switch (this.mode) {
				case "lists":
					display(new ProjectListMainView(this.projectId!), this.content, 'empty');
					break;
				case "tickets":
					display(new ProjectTicketsMainView(this.projectId!), this.content, 'empty');
					break;
				default:
					empty(this.content);
			}

		}

	}

}



///// utils

/**
 * Get the last href path of a a element
 **/
function getLastHrefPath(elem: HTMLElement) {
	const href = elem.getAttribute('href') as string;
	return href.substring(href.lastIndexOf('/') + 1);
}