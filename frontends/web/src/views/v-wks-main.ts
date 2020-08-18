import { pathAt } from 'common/route';
import { BaseViewElement } from 'common/v-base';
import { all, append, attr, className, customElement, elem, onHub } from 'dom-native';
import { asNum } from 'utils-min';

export const t = 123;

const subViews: any = {
	'images': 'v-images',
	'videos': 'v-videos',
	'timelines': 'v-timeline-main'
}
@customElement('v-wks-main')
export class WksMainView extends BaseViewElement {

	//// properties
	get wksId() { return asNum(attr(this, 'wks-id')) }

	//#region    ---------- Element & Hub Events ---------- 
	@onHub('routeHub', 'CHANGE')
	routeChange() {
		this.refresh();
	}
	//#endregion ---------- /Element & Hub Events ----------

	//#endregion ---------- /Data Event ---------- 
	async init() {
		// then initial render
		this.innerHTML = _render(this.wksId);
		this.refresh();
	}

	async refresh() {

		if (this.hasPathChanged(1)) {
			const newPath = pathAt(1) ?? 'videos';
			if (newPath) {
				all(this, ':scope > *')[1]?.remove();
				append(this, className(elem(subViews[newPath]), { screen: true }));
			}
		}


	}


}


function _render(wksId: number | null) {
	return `<v-nav></v-nav>`
}

