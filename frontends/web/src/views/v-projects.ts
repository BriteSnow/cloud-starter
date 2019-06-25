import { BaseViewElement } from './v-base';
import { customElement, onEvent, elem, onHub } from 'mvdom-xp';
import { on } from 'mvdom';
import { Project } from 'shared/entities';
import { projectDco } from 'ts/dcos';

@customElement('v-projects')
export class ProjectsView extends BaseViewElement {
	private _projects: Project[] = [];

	//// Data Setters
	set projects(projects: Project[]) {
		this._projects = projects;
		this.refresh();
	}

	//#region    ---------- Element & Hub Events ---------- 
	@onEvent('click', '.project-add')
	clickAddProject() {
		const dAddProject = elem('d-add-project');
		document.body.append(dAddProject);
		on(dAddProject, 'ADD_PROJECT', (evt) => {
			projectDco.create(evt.detail);
		});
	}

	@onHub('dcoHub', 'Project', 'create, update')
	async onProjectChange() {
		this._projects = await projectDco.list();
		this.refresh();
	}
	//#endregion ---------- /Element & Hub Events ---------- 

	async init() {
		super.init();
		this._projects = await projectDco.list();
		this.refresh();
	}

	refresh() {
		this.innerHTML = _render(this._projects);
	}
}

//// HTMLs

function _render(projects: Project[] = []) {
	let html = `	<header><h1>PROJECTS</h1></header>
	<section>
		<div class="card project-add">
			<c-symbol>ico-add</c-symbol>
			<h3>Add New Project</h3>
		</div>
	`;

	for (const p of projects) {
		html += `	<div class="card project">
		<header><h2>${p.name}</h2></header>
	</div>	`
	};

	html += `</section>`;

	return html;

}