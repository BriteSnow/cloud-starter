
import { BaseView, BaseViewClass, addHubEvents, addDomEvents } from './base';
import { display, closest, first, all, empty, hub, push } from 'mvdom';
import { HomeView } from './HomeView';
import { NavView } from './NavView';
import { SpecMainView } from './Spec/SpecMainView';
import { logoff, UserContext } from 'ts/user-ctx';


const defaultPath = "";

let pathToView: { [name: string]: BaseViewClass } = {
	"": HomeView,
	"_spec": SpecMainView,
};

export class MainView extends BaseView {
	private _userMenuShowing = false;
	private uc: UserContext;


	constructor(uc: UserContext) {
		super();
		this.uc = uc;
	}

	//// View key elements
	private get nav() { return first(this.el, 'nav')! };
	protected get main() { return first(this.el, 'main')! };
	protected get headerAside() { return first(this.el, 'header aside')! }
	protected get userMenu() { return first(this.el, 'header aside .menu')! };

	//#region    ---------- View Events ---------- 
	events = addDomEvents(this.events, {

		'click': async (evt) => {
			const target = evt!.target as HTMLElement;


			// if the menu is showing, we hide it only if the user is not clicking on the aside again 
			// ('click; aside' will handle the multi click on 'aside')
			if (this._userMenuShowing && target.closest('aside') !== this.headerAside) {
				this.userMenu.classList.add("displayNone");
				this._userMenuShowing = false;
			}
		},

		'click; .toogle-user-menu': async (evt) => {
			evt!.cancelBubble = true;
			if (this.userMenu.classList.contains('displayNone')) {
				this.userMenu.classList.remove('displayNone');
				this._userMenuShowing = true;
			} else {
				this.userMenu.classList.add('displayNone');
				this._userMenuShowing = false;
			}

		},

		'click; .do-logoff': async () => {
			await logoff();
			window.location.href = '/';
		}
	});
	//#endregion ---------- /View Events ----------

	//#region    ---------- Hub Events ----------
	hubEvents = addHubEvents(this.hubEvents, {
		// 'routeHub' is the hub receiving url changes
		'routeHub; CHANGE': () => {
			this.refresh();
		}
	});
	//#endregion ---------- /Hub Events ---------- 

	async postDisplay() {
		display(new NavView(''), this.nav, 'empty');

		// for now, the name will be the username
		push(this.headerAside, { name: this.uc.name });
	}

	private refresh() {
		const newPath = this.hasNewPathAt(0, defaultPath);

		// update this view/content only if the path has changed
		if (newPath != null) {
			const subViewClass = pathToView[newPath];
			if (subViewClass) {
				empty(this.main);
				display(new subViewClass, this.main, 'empty');
			} else {
				console.log(`ERROR - No view found for path ${newPath}`);
			}

		}

	}
}