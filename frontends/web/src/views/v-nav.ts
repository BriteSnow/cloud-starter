import { BaseViewElement } from './v-base';
import { customElement, onHub } from 'mvdom-xp';
import { all } from 'mvdom';
import { pathAt } from 'ts/route';

const defaultPath = '';

@customElement('v-nav')
export class NavView extends BaseViewElement {

	//#region    ---------- Element & Hub Events ---------- 
	@onHub('routeHub', 'CHANGE')
	routeChange() {
		this.refresh();
	}
	//#endregion ---------- /Element & Hub Events ---------- 

	init() {
		super.init();
		this.innerHTML = _render();
		this.refresh();
	}

	refresh() {
		let path0 = pathAt(0);

		path0 = (!path0) ? defaultPath : path0;

		for (const a of all(this, 'a')) {
			let href = a.getAttribute('href');
			let linkPath0 = (href) ? href.split('/')[1] : undefined;
			linkPath0 = (!linkPath0) ? '' : linkPath0;
			if (linkPath0 === path0) {
				a.classList.add('sel');
			} else if (a.classList.contains('sel')) {
				a.classList.remove('sel');
			}
		}
	}

}



//// HTML
function _render() {
	return `	<a href="/">
		<c-ico>home</c-ico><span class='bar'></span> <span class='label'>Home</span>
	</a>`;
}