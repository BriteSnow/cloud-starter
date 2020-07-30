import { mediaDco } from 'base/dcos';
import { customElement, onEvent, OnEvent, onHub } from 'dom-native';
import { Media } from 'shared/entities';
import { BaseViewElement } from 'views/v-base';

@customElement('v-videos')
export class VideosView extends BaseViewElement {

	//// Key Elements
	get contentEl() { return this } // for now the contentEl is this element
	get mediaAddEl() { return this.cacheFirst('.media-add')! }

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
	//#endregion ---------- /Element Events ----------

	//#region    ---------- Data Event ---------- 
	@onHub('dcoHub', 'Media', 'create,update')
	onMediaChange() {
		console.log('->> onMediaChange',);
		this.refresh();
	}

	//#endregion ---------- /Data Event ---------- 
	async init() {
		// then initial render
		this.refresh();
	}

	async refresh() {
		const mediaList = await mediaDco.list();
		this.contentEl.innerHTML = _renderContent(mediaList);
	}

}



function _renderContent(mediaList: (Media & { isVid?: boolean })[] = []) {
	return `
		<div class="media-add">
			<d-ico name="ico-add"></d-ico>
			<h3>Add Video</h3>
		</div>
		${mediaList.map(m => `
		<div class="card" data-id="${m.id}" data-type="Media">
			<header>
			<h2>${m.name}</h2>
			<d-ico name="ico-more"></d-ico>
			</header>
			<section>
			${m.url.endsWith('.mp4') ? `
				<video controls height="75">
					<source src="${m.url}" type="video/mp4">
				</video>			
			` : `
				<img src="${m.url}" />
			`}
			</section>
		</div>		
		`).join('\n')}
	`
}