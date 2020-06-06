import { projectDco } from 'base/dcos';
import { customElement, elem, on, onEvent, onHub } from 'dom-native';
import { Project } from 'shared/entities';
import { BaseViewElement } from './v-base';

@customElement('v-projects')
export class ProjectsView extends BaseViewElement {

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
		const projects = await projectDco.list();
		this.refresh(projects);
	}
	//#endregion ---------- /Element & Hub Events ---------- 


	async init() {
		super.init();

		// BEST-PRATICE: init() should always attempt to draw the empty state without async when possible
		//               Here we do this with `this.refresh([])` which will 
		this.refresh([]); // this will execute in sync as it will not do any server request

		// Now that this element has rendered its empty state, call this.refresh() will will initiate
		// an async data fetching and therefore will execute later.
		this.refresh();
	}

	async refresh(projects?: Project[]) {
		// if no projects, then, fetch the new list
		if (projects == null) {
			projects = await projectDco.list();
		}
		this.innerHTML = _render(projects);
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