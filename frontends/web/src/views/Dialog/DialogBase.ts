import { BaseView, addDomEvents } from '../base';
import { first, empty, append, frag, remove, pull, trigger } from 'mvdom';
import { render } from 'ts/render';

export interface FooterConfig {
	/** Either true/false or the label to be displayed in the button (default false, default label "OK") */
	ok?: boolean | string;
	/** Either true/false or the label to be display on the cancel (default false, default label "CANCEL") */
	cancel?: boolean | string;
}

const defaultFooter: FooterConfig = {
	ok: true,
	cancel: true
}

export type DialogBaseOpts = {
	cssExtra?: string;
}

export class DialogBase extends BaseView {
	opts: DialogBaseOpts;

	constructor(opts?: DialogBaseOpts) {
		super();
		this.opts = opts || {};
	}

	set title(title: string) {
		first(this.el, '.dialog > header > .title')!.innerText = title;
	}

	set content(content: HTMLElement | DocumentFragment) {
		append(first(this.el, '.dialog > section.content')!, content, 'empty');
	}

	set footer(footer: HTMLElement | DocumentFragment | FooterConfig | boolean) {
		const footerEl = first(this.el, '.dialog > footer')!;
		empty(footerEl);

		// if the the footer is set to true, then, we 
		if (typeof footer === 'boolean') {
			if (footer) {
				footer = defaultFooter;
			} else {
				return; // we do nothing if false
			}
		}

		if (footer instanceof HTMLElement || footer instanceof DocumentFragment) {
			append(footerEl, footer, 'empty');
		}
		// if it is an object, assume a FooterConfig
		else if (typeof footer === 'object') {
			const html = [];
			if (footer.cancel) {
				const label = (typeof footer.cancel === 'string') ? footer.cancel : "Cancel";
				html.push(`<button class="do-cancel">${label}</button>`);
			}
			if (footer.ok) {
				const label = (typeof footer.ok === 'string') ? footer.ok : "OK";
				html.push(`<button class="medium do-ok">${label}</button>`);
			}
			const htmlStr = html.join('\n');
			const f = frag(htmlStr);
			footerEl.appendChild(f);
		}

		footerEl.classList.remove('hide');
	}

	//#region    ---------- Dom Events ---------- 
	events = addDomEvents(this.events, {
		'click; .do-cancel': () => {
			this.doCancel();
		},

		'click; .do-ok': () => {
			this.doOk();
		},

		// this the close icon on the top right
		'click; .do-close': () => {
			this.doCancel();
		}
	});
	//#endregion ---------- /Dom Events ---------- 

	//#region    ---------- Controller Methods ---------- 
	create() {


		// here we do not call super.create, because no matter what the class, we want use the BaseDialog.tmpl
		let frag = render('DialogBase');

		// frag.firstElementChild!.classList.add('base-dialog');

		if (this.opts && this.opts.cssExtra) {
			frag.firstElementChild!.classList.add(this.opts.cssExtra);
		}

		const name = this.name.indexOf("$") > -1 ? this.name.slice(0, this.name.indexOf("$")) : this.name;
		frag.firstElementChild!.classList.add(name);
		return frag;
	}
	//#endregion ---------- /Controller Methods ---------- 

	protected async doCancel() {
		trigger(this.el, 'CANCEL');
		// by default, it will close
		this.doClose();
	}

	// by default, get the data, trigger the 'ok' event with the data in the event.details, and close
	protected async doOk() {
		const detail = pull(this.el);
		trigger(this.el, 'OK', { cancelable: true, detail });
		this.doClose();
	}

	doClose() {
		remove(this.el);
	}
}