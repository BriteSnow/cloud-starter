import { BaseView, addDomEvents } from 'views/base';
import { first, pull } from 'mvdom';
import { login } from 'ts/user-ctx';
import { ajaxPost, ajaxGet } from 'ts/ajax';

type Mode = 'login' | 'register';

export class LoginView extends BaseView {

	//// some dom element that will be used in this component view
	private get fieldset() { return first(this.el, 'section.content')! };
	private get footerMessage() { return first(this.el, 'footer .message')! };
	private get ghLink() { return first(this.el, 'a.to-github')! };

	//// the mode getter and setter which is DOM/Class backed, but exposed a simple object property
	private get mode(): Mode {
		if (this.el.classList.contains('login-mode')) {
			return 'login';
		} else {
			return 'register'
		}
	}

	private set mode(m: Mode) {
		if ('login' === m) {
			this.el.classList.remove('register-mode');
			this.el.classList.add('login-mode');
		} else {
			this.el.classList.add('register-mode');
			this.el.classList.remove('login-mode');
		}
	}

	private set message(txt: string | null) {
		if (txt != null) {
			this.footerMessage.innerText = txt;
			this.el.classList.add('has-message');
		} else {
			if (this.el.classList.contains('has-message')) {
				this.footerMessage.innerText = '';
				this.el.classList.remove('has-message');
			}
		}
	}

	//#region    ---------- View Events ---------- 
	events = addDomEvents(this.events, {

		// Click on the do button
		'click; button.do': async (evt) => {
			const mode = this.mode;
			if (mode == 'login') {
				this.doLogin();
			} else if (mode == 'register') {
				this.doRegister();
			} else {
				console.log(`ERROR - NOP - Mode '${mode}' unknown. Ignoring`);
			}

		},


		// Press enter
		'keyup; input': async (evt) => {
			if (evt instanceof KeyboardEvent) {
				this.message = null;
				if ('Enter' === evt.key) {
					const mode = this.mode;
					if ('login' === mode) {
						this.doLogin();
					} else {
						this.doRegister();
					}
				}
			}
		},

		// Toggle to register
		'click; .to-register': async (evt) => {
			this.mode = 'register';
		},

		// Toggle to login
		'click; .to-login': async (evt) => {
			this.mode = 'login';
		},
	});
	//#endregion  ---------- View Events ---------- 


	//#region    ---------- View Lifecycle ---------- 
	async postDisplay() {
		this.mode = this.mode;
		console.log('>>>', this.mode);
	}
	//#endregion ---------- /View Lifecycle ---------- 

	private async doLogin() {
		const data = pull(this.fieldset);
		console.log('>>> doLogin', data);
		try {
			const result = await login(data.username, data.pwd);
			if (result.success) {
				window.location.href = '/';
				return;
			} else {
				this.message = result.message;
			}

		} catch (ex) {
			console.log('error login', ex);
			this.message = ex.message;
		}
	}

	private async doRegister() {
		const data = pull(this.fieldset);

		try {
			const result = await ajaxPost('/api/register', data);

		} catch (ex) {
			console.log('error register', ex);
			this.footerMessage.innerText = ex.error || ex.message;
		}
	}

}