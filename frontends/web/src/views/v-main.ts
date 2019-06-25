import { first, push } from 'mvdom';
import { onEvent, onHub, customElement, elem } from 'mvdom-xp';
import { logoff, UserContext } from 'ts/user-ctx';
import { BaseViewElement } from './v-base';

const defaultPath = "";

const tagNameByPath: { [name: string]: string } = {
	"": 'v-projects',
	"_spec": 'v-spec-main',
};

@customElement('v-main')
export class MainView extends BaseViewElement {
	private _userMenuShowing = false;
	private _userContext?: UserContext;

	//// View key elements
	private get mainEl() { return first(this, 'main')! };
	private get headerAsideEl() { return first(this, 'header aside')! }
	private get userMenuEl() { return first(this, 'header aside c-menu')! };

	set userContext(v: UserContext) {
		this._userContext = v;
		push(this.headerAsideEl, { name: this._userContext.name });
	}

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
		const newPath = this.hasNewPathAt(0, defaultPath);

		// update this view/content only if the path has changed
		if (newPath != null) {
			const tagName = tagNameByPath[newPath];
			this.mainEl.innerHTML = `<${tagName}></${tagName}>`;
		}
	}

}

//// HTML
function _render() {
	return `
	<header>
		<c-ico class="to-menu">menu</c-ico>
		<h3>CLOUD STARTER</h3>
		<aside class="toogle-user-menu">
			<c-ico>user</c-ico>
			<div class="dx dx-name">Some name</div>
			<c-menu class="display-none">
					<div class="do-logoff">Logoff</div>
					<a href="#profile">Profile</a>
			</c-menu>
		</aside>
	</header>
	
	<v-nav></v-nav>

	<main>
	</main>
	<footer>
		some footer
	</footer>`
}