
import { BaseView, addDomEvents } from 'views/base';
import { DialogBase, DialogBaseOpts } from '../Dialog/DialogBase';
import { labelDso, paneDso } from 'ts/dsos';
import { render } from 'ts/render';
import { all, pull } from 'mvdom';
import { Label, Pane } from 'shared/entities';

type Mode = 'edit' | 'add';

export class ProjectPaneConfigDialog extends DialogBase {

	private paneId?: number;
	private projectId!: number; // after init, this will always be present.

	constructor(data: { projectId?: number, paneId?: number, opts?: DialogBaseOpts }) {
		super();
		if (data) {
			if (data.projectId != null) {
				this.projectId = data.projectId;
			}
			if (data.paneId != null) {
				this.paneId = data.paneId;
			}
		}
	}

	//#region    ---------- View State ---------- 
	get mode(): Mode {
		if (this.el.classList.contains('mode-add')) {
			return 'add';
		} else {
			return 'edit';
		}
	}

	set mode(m: Mode) {
		if (m === 'add') {
			this.el.classList.add('mode-add');
		} else {
			this.el.classList.remove('mode-add');
		}
	}
	//#endregion ---------- /View State ---------- 


	//#region    ---------- View DOM Events ---------- 
	events = addDomEvents(this.events, {

		'CHANGE; em.check': (evt) => {
			const em = evt.selectTarget;
		},

		'OK': async (evt) => {
			// get the form data (with the .dx mvdom pull)
			const fieldsData = pull(this.el);
			// get the selected labelIds
			const labelIds = this.getLabelIds();
			if (this.paneId != null) {
				paneDso.update(this.paneId, { ...fieldsData, ...{ labelIds } });
			} else {
				const projectId = this.projectId;
				paneDso.create({ ...fieldsData, ...{ projectId } });
			}

		}

	});
	//#endregion ---------- /View DOM Events ---------- 

	//#region    ---------- View Controller Methods ---------- 
	async init() {
		let projectId: number;
		let pane: Pane | null = null;

		if (this.paneId != null) {
			pane = await paneDso.get(this.paneId);
			this.projectId = projectId = pane.projectId;
		} else {
			// if this.projectId is null, throw error
			if (this.projectId == null) {
				throw new Error(`cannot instantiate ProjectPaneConfigDialog without`)
			}
			projectId = this.projectId;
		}

		this.mode = (pane) ? 'edit' : 'add';

		const labels: (Label & { sel?: boolean })[] = await labelDso.list({ projectId });

		if (pane) {
			this.title = `Edit List: ${pane.name}`;
			if (pane.labelIds != null) {
				labels.forEach(l => l.sel = (pane!.labelIds!.includes(l.id)))
			}
		} else {
			this.title = 'Add new List'
		}

		const contentData = { ...pane, ...{ labels } };
		this.content = render('ProjectPaneConfigDialog-content', contentData);
		this.footer = true;
	}
	//#endregion ---------- /View Controller Methods ---------- 


	//#region    ---------- Public APIs ---------- 
	getLabelIds() {
		const checkboxes = Array.from(all(this.el, 'em.check-on'));
		return checkboxes.map(c => parseInt(c.closest('li')!.getAttribute('data-entity-id')!))
	}
	//#endregion ---------- /Public APIs ---------- 

}