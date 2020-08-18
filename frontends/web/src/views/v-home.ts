import { BaseViewElement } from 'common/v-base';
import { wksDco } from 'dcos';
import { customElement, elem, on, onEvent, onHub } from 'dom-native';
import { Wks } from 'shared/entities';

@customElement('v-home')
export class wksListView extends BaseViewElement {

	//#region    ---------- Element & Hub Events ---------- 
	@onEvent('click', '.wks-add')
	clickAddWks() {
		const dAddWks = elem('d-add-wks');
		document.body.append(dAddWks);
		on(dAddWks, 'ADD_WKS', (evt) => {
			wksDco.create(evt.detail);
		});
	}

	@onHub('dcoHub', 'Wks', 'create, update')
	async onWksChange() {
		const wksList = await wksDco.list();
		this.refresh(wksList);
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

	async refresh(wksList?: Wks[]) {
		// if no wksList, then, fetch the new list
		if (wksList == null) {
			wksList = await wksDco.list();
		}
		this.innerHTML = _render(wksList);
	}
}

//// HTMLs

function _render(wksList: Wks[] = []) {
	let html = `	<header><h1>Workspaces</h1></header>
	<section>
		<div class="card wks-add">
			<c-symbol>ico-add</c-symbol>
			<h3>Add New Workspace</h3>
		</div>
	`;

	for (const p of wksList) {
		html += `	<a class="card wks" href="/${p.id}">
		<header><h2>${p.name}</h2></header>
	</a>	`
	};

	html += `</section>`;

	return html;

}