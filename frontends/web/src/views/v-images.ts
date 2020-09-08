import { position } from '@dom-native/draggable';
import { BaseViewElement } from 'common/v-base';
import { mediaDco } from 'dcos';
import { append, attr, closest, customElement, first, on, onEvent, OnEvent, onHub } from 'dom-native';
import { Media } from 'shared/entities';
import { asNum } from 'utils-min';

@customElement('v-images')
export class ImageView extends BaseViewElement {

	//// Key Elements
	get contentEl() { return this } // for now the contentEl is this element
	get mediaAddEl() { return this.cacheFirst('.media-add')! }

	//// properties
	get wksId() { return asNum(attr(this, 'wks-id')) }

	//#region    ---------- Element Events ---------- 
	@onEvent('dragenter,dragover', '.media-add')
	enableDrop(evt: DragEvent) {
		evt.preventDefault()
	}

	@onEvent('drop', '.media-add')
	async viewAdd(evt: DragEvent & OnEvent) {
		evt.preventDefault();
		evt.stopPropagation();
		const file = evt.dataTransfer?.files?.[0];
		if (file != null) {
			await mediaDco.create({ file });
		}
	}


	@onEvent('pointerup', '.show-menu')
	onCardShowMenuUp(evt: PointerEvent & OnEvent) {
		if (first('#image-card-menu') == null) {

			const [menu] = append(document.body, `
			<c-menu id='image-card-menu'>
			<li class="do-delete">Delete</li>
			</c-menu>`);

			position(menu, evt.selectTarget, { at: 'bottom', align: 'right' });

			const cardEl = closest(evt.selectTarget, '[data-type="Media"]');
			on(menu, 'pointerup', '.do-delete', async (evt) => {
				const id = asNum(cardEl?.getAttribute('data-id'));
				if (id == null) {
					throw new Error(`UI ERROR - cannot find data-type Media data-id on element ${cardEl}`);
				}
				await mediaDco.remove(id);
			})
		}
	}
	//#endregion ---------- /Element Events ----------

	//#region    ---------- Data Event ---------- 
	@onHub('dcoHub', 'Media', 'create,update,remove')
	onMediaChange() {
		this.refresh();
	}

	//#endregion ---------- /Data Event ---------- 
	async init() {
		// then initial render
		this.refresh();
	}

	async refresh() {
		const mediaList = await mediaDco.listImages();
		this.contentEl.innerHTML = _renderContent(mediaList);
	}

}



function _renderContent(mediaList: Media[] = []) {
	return `
		<header>
		<h1>Images</h1>
		</header>	
		<section class="content">
			<div class="card-add media-add">
				<d-ico name="ico-add"></d-ico>
				<h3>Add Image</h3>
			</div>
			${mediaList.map(m => `
				<div class="card" data-id="${m.id}" data-type="Media">
					<header>
					<h2>${m.name}</h2>
					<c-ico src="#ico-more" class="show-menu"></c-ico>
					</header>
					<section>
						<img src="${m.url}"></img>
					</section>
				</div>		
			`).join('\n')}
		</section>
	`
}