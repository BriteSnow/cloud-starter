// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/frontends/web/src/views/spec/spec-main.ts" />

import { pathAt } from 'common/route.js';
import { BaseViewElement } from 'common/v-base.js';
import { all, customElement, first, onHub } from 'dom-native';
import { tagNameByName } from './spec-paths.js';

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
		if (this.hasPathChanged(1)) {
			const newPath = pathAt(1) ?? 'typo';
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