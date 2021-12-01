import { position } from '@dom-native/draggable';
import { BaseViewElement } from 'common/v-base.js';
import { mediaDco } from 'dcos';
import { append, closest, customElement, first, on, onEvent, OnEvent, onHub } from 'dom-native';
import { Media } from 'shared/entities.js';
import { asNum } from 'utils-min';

@customElement('v-videos')
export class VideosView extends BaseViewElement {

	//// Key Elements
	get contentEl() { return this } // for now the contentEl is this element
	get mediaAddEl() { return this.cacheFirst('.media-add')! }

	//#region    ---------- Element Events ---------- 

	@onEvent('pointerup', '.show-menu')
	onCardShowMenuUp(evt: PointerEvent & OnEvent) {

		if (first('#media-card-menue') == null) {

			const [menu] = append(document.body, `
			<c-menu id='media-card-menue'>
				<li class="do-delete">Delete</li>
			</c-menu>`);

			position(menu, evt.selectTarget, { at: 'bottom', align: 'right' });

			const cardEl = closest(evt.selectTarget, '[data-type="Media"]');
			on(menu, 'pointerup', '.do-delete', async (evt) => {
				const id = asNum(cardEl?.getAttribute('data-id'));
				if (id == null) {
					throw new Error(`UI ERROR - cannot find data-type=Media ${cardEl}`);
				}
				await mediaDco.remove(id);
			})
		}
	}

	@onEvent('dragenter,dragover', '.media-add')
	enableDrop(evt: DragEvent) {
		evt.preventDefault();
		const firstItem = evt.dataTransfer?.items[0];
		if (firstItem != null) {
			if (firstItem.type.startsWith('video')) {
				// we are ok. 
				// Note: for this event, evt.dataTransfer?.files[0] is not defined
			} else {
				// TODO: we get firstItem.type
			}
		}
	}

	@onEvent('drop', '.media-add')
	async viewAdd(evt: DragEvent & OnEvent) {
		evt.preventDefault();
		evt.stopPropagation();
		const file = evt.dataTransfer?.files?.[0];
		if (file != null && file.type.startsWith('video')) {
			await mediaDco.create({ file });
		} else {
			// TODO: show message not valid
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
		const mediaList = await mediaDco.listVideos();
		this.contentEl.innerHTML = _renderContent(mediaList);
	}

}

function _renderContent(mediaList: Media[] = []) {
	return `
		<header>
		<h1>Videos</h1>
		</header>	
		<section class="content">
			<div class="card-add media-add">
				<d-ico name="ico-add"></d-ico>
				<h3>Add Video</h3>
			</div>
			${mediaList.map(m => `
				<div class="card" data-id="${m.id}" data-type="Media">
					<header>
					<h2>${m.name}</h2>
					<c-ico src="#ico-more" class="show-menu"></c-ico>
					</header>
					<section>
						<video controls>
							<source src="${m.sdUrl ?? m.url}" type="video/mp4">
						</video>			
					</section>
				</div>		
			`).join('\n')}
		</section>
	`
}