import { getGoogleOAuthUrl, login } from 'common/user-ctx.js';
import { BaseViewElement } from 'common/v-base.js';
import { webPost } from 'common/web-request.js';
import { customElement, first, onEvent, OnEvent, pull, style } from 'dom-native';

type Mode = 'login' | 'register';

@customElement('v-admin-login')
export class LoginView extends BaseViewElement {

	//// some dom element that will be used in this component view
	private get fieldset() { return first(this, 'section.content')! };
	private get footerMessage() { return first(this, 'footer .message')! };
	private get googleLink() { return first(this, 'a.google-oauth')! };

	//// the mode getter and setter which is DOM/Class backed, but exposed a simple object property
	private set message(txt: string | null) {
		if (txt != null) {
			this.footerMessage.textContent = txt;
			this.classList.add('has-message');
		} else {
			if (this.classList.contains('has-message')) {
				this.footerMessage.textContent = '';
				this.classList.remove('has-message');
			}
		}
	}

	//#region    ---------- Element Events ---------- 
	//> In this section put all of the @onEvent bindings, which is event bound to the `this` element.
	@onEvent('click', 'button.do')
	headerClicked(evt: MouseEvent & OnEvent) {
		this.doLogin();
	}

	@onEvent('keyup', 'input')
	_keyup(evt: KeyboardEvent & OnEvent) {
		this.message = null;
		if ('Enter' === evt.key) {
			this.doLogin();
		}
	}
	//#endregion ---------- /Element Events ----------

	//#region    ---------- Lifecycle ---------- 
	init() {
		super.init();
		this.innerHTML = _render();
	}

	async postDisplay() {
		// make the google link look disabled
		style(this.googleLink, { opacity: '0.5' });
		const oauthUrl = await getGoogleOAuthUrl();
		if (oauthUrl) {
			this.googleLink.setAttribute('href', oauthUrl);
			// remove opacity to be full
			style(this.googleLink, { opacity: '' });
		}
	}
	//#endregion ---------- /Lifecycle ---------- 

	private async doLogin() {
		const data = pull(this.fieldset);
		try {
			const result = await login(data.username, data.pwd);
			if (result.success) {
				window.location.href = '/';
				return;
			} else {
				this.message = result.error.message;
			}

		} catch (ex: any) {
			this.message = ex.error.message;
		}
	}

	private async doRegister() {
		const data = pull(this.fieldset);

		try {
			const result = await webPost('/api/register', { body: data });
		} catch (ex: any) {
			console.log('error register', ex);
			this.footerMessage.textContent = ex.error || ex.message;
		}
	}
}



// <div class="LoginView login-mode">

function _render() {
	return `
	<div class="dialog">
		<header>CLOUD-BIGAPP ADMIN</header>
		<section class="content">
			<d-input name="username" placeholder="username"></d-input>
			<d-input name="pwd" password placeholder="password" ico-trail="d-ico-visible"></d-input>
			<div></div>
			<button class="do high for-login">Login</button>
		</section>
		<footer>
			<div class="message"></div>
			<a class="high to-login for-register">Login</a>
		</footer>
	</div>`;
}