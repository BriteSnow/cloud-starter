import { getRouteWksId, pathAt } from 'base/route';
import { logoff, UserContext } from 'base/user-ctx';
import { customElement, first, onEvent, onHub, push } from 'dom-native';
import { isNotEmpty } from 'utils-min';
import { BaseViewElement } from './v-base';

const defaultPath = "";

const tagNameByPath: { [name: string]: string } = {
	"": 'v-home',
	"_spec": 'v-spec-main',
};

@customElement('v-main')
export class MainView extends BaseViewElement {
	private _userMenuShowing = false;
	private _userContext?: UserContext;

	//// Key elements
	private get mainEl() { return first(this, 'main')! };
	private get headerAsideEl() { return first(this, 'header aside')! }
	private get userMenuEl() { return first(this, 'header aside c-menu')! };

	//#region    ---------- Data Setters ---------- 
	set userContext(v: UserContext) {
		this._userContext = v;
		push(this.headerAsideEl, { name: this._userContext.name });
	}
	//#endn pregion ---------- /Data Setters ---------- 


	//#region    ---------- Element & Hub Events ---------- 
	// TODO: this should be fixed with the when moved to a c-menu-popup
	@onEvent('click')
	clickToToggleUserMenuOff(evt: MouseEvent) {
		const target = evt!.target as HTMLElement;
		// if the menu is showing, we hide it only if the user is not clicking on the aside again 
		// ('click; aside' will handle the multi click on 'aside')
		if (this._userMenuShowing && target.closest('aside') !== this.headerAsideEl) {
			this.userMenuEl.classList.add("display-none");
			this._userMenuShowing = false;
		}
	}

	@onEvent('click', '.toogle-user-menu')
	clickToToogleUserMenuOn(evt: MouseEvent) {
		evt!.cancelBubble = true;
		if (this.userMenuEl.classList.contains('display-none')) {
			this.userMenuEl.classList.remove('display-none');
			this._userMenuShowing = true;
		} else {
			this.userMenuEl.classList.add('display-none');
			this._userMenuShowing = false;
		}
	}

	@onEvent('click', '.do-logoff')
	async clickToLogoff() {
		await logoff();
		window.location.href = '/';
	}

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
		if (this.hasPathChanged(0)) {
			// first, try to get the wksId from the route, and if valid, then, show v-wks-main
			const wksId = getRouteWksId();
			const newPath = pathAt(0);
			console.log('->> ', newPath, wksId);

			if (newPath != null && wksId != null) {
				this.mainEl.innerHTML = `<v-wks-main wks-id="${wksId}"></v-wks-main>`;
			}
			else {
				const name = isNotEmpty(newPath) ? newPath : '';

				const tagName = tagNameByPath[name];
				this.mainEl.innerHTML = `<${tagName}></${tagName}>`;
			}
		}





	}

}

//// HTML
function _render() {
	return `
	<header>
		<d-ico name="ico-menu">menu</d-ico>
		<a href='/'><h3>CLOUD BIGAPP</h3></a>
		<aside class="toogle-user-menu">
			<c-ico>user</c-ico>
			<div class="dx dx-name">Some name</div>
			<c-menu class="display-none">
				<div class="do-logoff">Logoff</div>
				<a href="#profile">Profile</a>
			</c-menu>
		</aside>
	</header>

	<main>
	</main>
	<footer>
		some footer
	</footer>
	<div class="__version__">${window.__version__}</div>
	`
}