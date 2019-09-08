import { all, customElement, first, onHub } from 'mvdom';
import { BaseViewElement } from 'views/v-base';
import { tagNameByName } from './spec-paths';

const defaultPath = 'typo';

@customElement('v-spec-main')
export class SpecMainView extends BaseViewElement {

	//// Key Elements
	protected get contentEl() { return first(this, 'section.content')! }

	//#region    ---------- Element & Hub Events ---------- 
	@onHub('routeHub', 'CHANGE')
	routChange() {
		this.refresh()
	}
	//#endregion ---------- /Element & Hub Events ---------- 

	init() {
		super.init();
		this.innerHTML = _render();
		this.refresh();
	}

	refresh() {
		const newPath = this.hasNewPathAt(1, defaultPath);
		if (newPath != null) {
			const tagName = tagNameByName[newPath]!;
			this.contentEl.innerHTML = `<${tagName}></${tagName}>`;

			// enable tabs
			const href = `/_spec/${newPath}`;
			for (const tab of all(this, '.tab-bar a')) {
				const tabHref = tab.getAttribute('href');
				if (tab.classList.contains('sel') && tabHref !== href) {
					tab.classList.remove('sel');
				} else if (tabHref === href) {
					tab.classList.add('sel');
				}
			}
		}
	}
}


//// HTML

function _render() {
	let html = '<div class="tab-bar">';
	for (const name of Object.keys(tagNameByName)) {
		html += `<a href="/_spec/${name}">${name}</a>`
	}
	html += `</div>
	<section class="content">
	</section>`;

	return html;
}