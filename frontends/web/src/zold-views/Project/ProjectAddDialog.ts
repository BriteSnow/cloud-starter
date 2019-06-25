import { DialogBase } from "zold-views/Dialog/DialogBase";
import { render } from "ts/render";
import { Project } from "shared/entities";
import { on } from "cluster";
import { addDomEvents } from "zold-views/base";
import { pull } from "mvdom";

type AddListener = ((project: Partial<Project>) => void);

export class ProjectAddDialog extends DialogBase {
	private _addListenerList: AddListener[] = [];


	events = addDomEvents(this.events, {

		'OK': async (evt) => {
			const data = pull(this.content as HTMLElement) as Partial<Project>;
			// TODO: needs to validate it is a Partial<Project>
			for (const l of this._addListenerList) {
				l(data);
			}
		},
	});

	init() {
		this.title = 'Add Project';
		this.content = render('ProjectAddDialog-content');
		this.footer = { ok: 'Add Project', cancel: true };
	}


	onAdd(listener: AddListener) {
		this._addListenerList.push(listener);
	}

}