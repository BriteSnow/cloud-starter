import { all, append, attr, customElement, elem } from 'dom-native';
import { asNum } from 'utils-min';
import { BaseViewElement } from '../views/v-base';

export const t = 123;

const subViews: any = {
	'': 'v-images',
	'images': 'v-images',
	'videos': 'v-videos'
}
@customElement('v-wks-main')
export class WksMainView extends BaseViewElement {

	//// properties
	get wksId() { return asNum(attr(this, 'wks-id')) }


	//#endregion ---------- /Data Event ---------- 
	async init() {
		// then initial render
		this.innerHTML = _render(this.wksId);
		this.refresh();
	}

	async refresh() {
		const newPath = this.hasNewPathAt(1, '');
		if (newPath) {
			all(this, ':scope > *')[1]?.remove();
			append(this, elem(subViews[newPath]));
		}

	}


}


function _render(wksId: number | null) {
	return `<nav>
			<a href="/${wksId}/images"><label>Images</label></a>
			<a href="/${wksId}/videos"><label>Videos</label></a>
		</nav>
  `
}

