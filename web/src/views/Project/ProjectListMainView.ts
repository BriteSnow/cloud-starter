import { BaseView, addDomEvents, addHubEvents } from 'views/base';
import { ticketDso, paneDso } from 'ts/dsos';
import { first, append, display, on, push } from 'mvdom';
import { render } from 'ts/render';
import { ProjectPaneConfigDialog } from './ProjectPaneConfigDialog';
import { getLuma } from 'ts/utils';
import { Pane } from 'shared/entities';

export class ProjectListMainView extends BaseView {

	projectId!: number;

	constructor(projectId: number) {
		super();
		this.projectId = projectId;
	}

	//#region    ---------- Hub Events ---------- 
	hubEvents = addHubEvents(this.hubEvents, {

		'dsoHub; Pane; update': async (pane: Pane) => {
			this.refreshPaneUI(pane.id);
		},
		'dsoHub; Pane; create': async (pane: Pane) => {
			this.createPaneUI(pane);
		}
	});
	//#endregion ---------- /Hub Events ---------- 


	//#region    ---------- View DOM Events ---------- 
	events = addDomEvents(this.events, {
		'click; .show-add': (evt) => {
			display(new ProjectPaneConfigDialog({ projectId: this.projectId }), 'body');
		},

		'click; .card > header .ico-more': async (evt) => {
			const paneEl = evt.selectTarget.closest('[data-type="Pane"]')!;
			const paneId = parseInt(paneEl.getAttribute('data-id')!);

			// TODO: need to get the labelIds to set the checbox
			const d = await display(new ProjectPaneConfigDialog({ paneId }), 'body');
		}
	});

	closestEvents = addDomEvents(this.closestEvents, {
		'.ProjectMainView; click; button.main-add': (evt) => {
			display(new ProjectPaneConfigDialog({ projectId: this.projectId }), 'body');
		}
	});

	//#endregion ---------- /View DOM Events ---------- 


	//#region    ---------- View Controller Methods ---------- 
	async postDisplay() {
		this.refresh();
	}
	//#endregion ---------- /View Controller Methods ---------- 


	async refresh() {
		const projectId = this.projectId;

		// first get all of the panes
		const panes = await paneDso.list({ projectId });

		for (const pane of panes) {
			this.createPaneUI(pane);
		}

	}

	async createPaneUI(pane: Pane) {
		const addEl = first(this.el, '.show-add')!;
		const cardFrag = render('ProjectListMainView-pane', pane)
		append(addEl, cardFrag, 'before');
		this.refreshPaneUI(pane.id);
	}

	async refreshPaneUI(paneId: number) {
		const paneEl = first(this.el, `[data-type='Pane'][data-id='${paneId}']`);
		if (paneEl == null) {
			console.log(`cannot find pane for ${paneId}`);
			return;
		}

		const pane = await paneDso.get(paneId);
		push(paneEl, pane);
		const tickets = await ticketDso.list({ projectId: this.projectId, labelIds: pane.labelIds });
		// TODO: need to move the 'isDark' somewhere else, perhaps on import time
		for (const t of tickets) {
			if (t.labels) {
				for (const l of t.labels) {
					const luma = getLuma(l.color);
					l.luma = luma;
					l.isDark = (l.luma < 150);
				}
			}
		}
		const sectionEl = first(paneEl, '.card > section')!;
		append(sectionEl, render('ProjectListMainView-tickets', { tickets }), 'empty');
	}

}