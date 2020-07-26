import { mediaDco } from 'base/dcos';
import { attr, customElement, onEvent, OnEvent, onHub } from 'dom-native';
import { Media } from 'shared/entities';
import { asNum } from 'utils-min';
import { BaseViewElement } from 'views/v-base';

export const t = 123;

@customElement('v-wks-main')
export class wksMainView extends BaseViewElement {

	//// Key Elements
	get contentEl() { return this.cacheFirst('section.content')! }
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
	//#endregion ---------- /Element Events ----------

	//#region    ---------- Data Event ---------- 
	@onHub('dcoHub', 'Media', 'create,update')
	onMediaChange() {
		console.log('->> onMediaChange',);
		this.refreshContent();
	}

	//#endregion ---------- /Data Event ---------- 
	async init() {
		// then initial render
		this.innerHTML = _render(this.wksId);
		this.refreshContent();
	}

	async refreshContent() {
		const mediaList = await mediaDco.list();
		this.contentEl.innerHTML = _renderContent(mediaList);
	}


}


function _render(wksId: number | null) {
	return `<nav>
		<a href="/${wksId}/media"><label>Media</label></a>
	</nav>
	<section class='content'> 
		${_renderContent()}
  </section>
  `
}

function _renderContent(mediaList: Media[] = []) {
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
			<img src="${m.url}" />
			</section>
		</div>		
		`).join('\n')}
	`
}