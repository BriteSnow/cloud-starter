
import { all, first } from 'mvdom';
import { pathAt, paths } from 'ts/route';
import { addDomEvents, addHubEvents, BaseView } from './base';

export class NavView extends BaseView {
	defaultPath: string;

	//// View key elements
	private get productsEl() { return first(this.el, 'section ul') };

	constructor(defaultPath: string) {
		super();
		this.defaultPath = defaultPath;
		this.data = { paths: paths() };
	}

	//#region    ---------- DOM Events ---------- 
	events = addDomEvents(this.events, {
	});
	//#endregion ---------- /DOM Events ----------

	//#region    ---------- Hub Events ---------- 
	hubEvents = addHubEvents(this.hubEvents, {

		// register to the routeHub to listen route changes
		'routeHub; CHANGE': async () => {
			this.refreshMenu();
		},

		// Listen to the dcoHub to listen to Product objec change
		'dcoHub; Product; create, update, remove': async (data) => {
			await this.refreshMenu();
		}

	});
	//#endregion ---------- /Hub Events ---------- 

	//#region    ---------- View Controller Methods---------- 
	// before we get any routeHub events, build the list of products
	async init() {
	}

	async postDisplay() {
		await this.refreshMenu();
	}
	//#endregion ---------- /View Controller Methods---------- 



	private refreshMenu() {
		let path0 = pathAt(0);

		path0 = (!path0) ? this.defaultPath : path0;

		for (const a of all(this.el, 'a')) {
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