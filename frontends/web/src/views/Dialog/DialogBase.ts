import { BaseView, addDomEvents } from '../base';
import { first, empty, append, frag, remove, pull, trigger } from 'mvdom';
import { render } from 'ts/render';
import { draggable } from 'mvdom-xp';
import { style } from 'mvdom-xp';

export interface FooterConfig {
	/** Either true/false or the label to be displayed in the button (default false, default label "OK") */
	ok?: boolean | string;
	/** Either true/false or the label to be display on the cancel (default false, default label "CANCEL") */
	cancel?: boolean | string;

	/** The left button (default false) */
	extra?: boolean | string;
}

const defaultFooter: FooterConfig = {
	ok: true,
	cancel: true,
	extra: false
}

export type DialogBaseOpts = {
	cssExtra?: string;
	style?: Partial<CSSStyleDeclaration>;
}

export class DialogBase extends BaseView {
	opts: DialogBaseOpts;
	private _title?: string;
	private _content?: HTMLElement | DocumentFragment;
	private _footer?: HTMLElement | DocumentFragment | FooterConfig | boolean;

	constructor(opts?: DialogBaseOpts) {
		super();
		this.opts = opts || {};
	}

	get header() { return first(this.el, '.dialog > header')! };

	set title(title: string) {
		const titleEl = first(this.el, '.dialog > header > .title');
		if (titleEl) {
			titleEl.innerText = title;
		}
		// if not el yet, then, store it in temp
		else {
			this._title = title;
		}

	}

	set content(content: HTMLElement | DocumentFragment) {
		const contentEl = first(this.el, '.dialog > section.dialog-content');
		if (contentEl) {
			append(contentEl, content, 'empty');
		} else {
			this._content = content;
		}

	}

	set footer(footer: HTMLElement | DocumentFragment | FooterConfig | boolean) {
		const footerEl = first(this.el, '.dialog > footer')!;
		// if we do not ahve a footer element yet, we store it in temp, and return
		// It will be set later by init
		if (!footerEl) {
			this._footer = footer;
			return;
		}
		empty(footerEl);

		// if the the footer is set to true, then, we 
		if (footer === false) {
			footerEl.style.display = 'none';
			return; // we do nothing if false			
		}

		if (footer instanceof HTMLElement || footer instanceof DocumentFragment) {
			append(footerEl, footer, 'empty');
		}
		// if it is an object, assume a FooterConfig
		else if (typeof footer === 'object') {
			const html = [];
			if (footer.extra) {
				const label = (typeof footer.extra === 'string') ? footer.extra : "delete";
				html.push(`<button class="do-extra">${label}</button>`);
				html.push(`<div class="spacer"></div>`);
			}

			if (footer.cancel) {
				const label = (typeof footer.cancel === 'string') ? footer.cancel : "Cancel";
				html.push(`<button class="do-cancel">${label}</button>`);
			}
			if (footer.ok) {
				const label = (typeof footer.ok === 'string') ? footer.ok : "OK";
				html.push(`<button class="do-ok medium">${label}</button>`);
			}
			const htmlStr = html.join('\n');
			const f = frag(htmlStr);
			footerEl.appendChild(f);
		}
		footerEl.style.display = null;
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

		'click; .do-extra': () => {
			this.doExtra();
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
		const el = frag.firstElementChild! as HTMLElement;
		const dialogEl = first(el, '.dialog')!;

		// frag.firstElementChild!.classList.add('base-dialog');
		if (this.opts) {
			if (this.opts.cssExtra) {
				dialogEl.classList.add(this.opts.cssExtra);
			}
			if (this.opts.style) {
				style(dialogEl, this.opts.style);
			}
		}

		const name = this.name.indexOf("$") > -1 ? this.name.slice(0, this.name.indexOf("$")) : this.name;

		el.classList.add(name);

		return frag;
	}

	init() {
		// if we have some temp _title or _content, set it. 
		if (this._title) {
			this.title = this._title;
			this._title = undefined;
		}
		if (this._content) {
			this.content = this._content;
			this._content = undefined;
		}
		if (this._footer) {
			this.footer = this._footer;
			this._footer = undefined;
		}
	}

	postDisplay() {
		draggable(this.el, '.dialog > header', {
			onStart: (evt) => {
				console.log(`start dragging dialog`);
			}
		});
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
		trigger(this.el, 'OK');
		this.doClose();
	}

	protected async doExtra() {
		trigger(this.el, 'EXTRA');
		this.doClose();
	}

	doClose() {
		remove(this.el);
	}
}