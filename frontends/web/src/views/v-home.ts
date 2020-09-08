import { position } from '@dom-native/draggable';
import { BaseViewElement } from 'common/v-base';
import { wksDco } from 'dcos';
import { append, closest, customElement, elem, first, on, OnEvent, onEvent, onHub } from 'dom-native';
import { Wks } from 'shared/entities';
import { asNum } from 'utils-min';

@customElement('v-home')
export class wksListView extends BaseViewElement {

	//#region    ---------- Events---------- 
	@onEvent('click', '.wks-add')
	clickAddWks() {
		const dialogEl = append(document.body, elem('dg-wks-add'));
		on(dialogEl, 'WKS_ADD', (evt) => {
			wksDco.create(evt.detail);
		});
	}

	// Note: since .card is a <a> tag, prevent following on click on .show-menu (must bind to click)
	@onEvent('click', 'a .show-menu')
	onShowClick(evt: MouseEvent & OnEvent) {
		evt.preventDefault();
		evt.cancelBubble = true;
	}

	@onEvent('pointerup', '.show-menu')
	onCardShowMenuUp(evt: PointerEvent & OnEvent) {

		if (first('#wks-card-menu') == null) {

			const [menu] = append(document.body, `
			<c-menu id='wks-card-menu'>
			<li class="do-delete">Delete</li>
			</c-menu>`);

			position(menu, evt.selectTarget, { at: 'bottom', align: 'right' });

			const cardEl = closest(evt.selectTarget, '[data-type="Wks"]');
			on(menu, 'pointerup', '.do-delete', async (evt) => {
				const id = asNum(cardEl?.getAttribute('data-id'));
				if (id == null) {
					throw new Error(`UI ERROR - cannot find data-type Case data-id on element ${cardEl}`);
				}
				await wksDco.remove(id);
			})
		}
	}
	//#endregion ---------- /Events---------- 

	//#region    ---------- Hub Events ---------- 
	@onHub('dcoHub', 'Wks', 'create, update, remove')
	async onWksChange() {
		const wksList = await wksDco.list();
		this.refresh(wksList);
	}
	//#endregion ---------- /Hub Events ---------- 


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
			<c-ico src="#ico-add"></c-ico>
			<h3>Add New Workspace</h3>
		</div>
	`;

	for (const p of wksList) {
		html += `	<a class="card wks" data-type="Wks" data-id="${p.id}" href="/${p.id}">
		<header>
			<h2>${p.name}</h2>
			<c-ico src="#ico-more" class="show-menu"></c-ico>
		</header>
	</a>	`
	};

	html += `</section>`;

	return html;

}