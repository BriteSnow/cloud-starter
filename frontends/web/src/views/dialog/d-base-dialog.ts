import { append, BaseHTMLElement, first, frag, onEvent, trigger } from 'mvdom';

export interface FooterConfig {
	/** Either true/false or the label to be displayed in the button (default false, default label "OK") */
	ok?: boolean | string;
	/** Either true/false or the label to be display on the cancel (default false, default label "CANCEL") */
	cancel?: boolean | string;

	/** The left button (default false) */
	extra?: boolean | string;
}

export type DialogBaseOpts = {
	cssExtra?: string;
	style?: Partial<CSSStyleDeclaration>;
}

const defaultFooter: FooterConfig = {
	ok: true,
	cancel: true,
	extra: false
}

export class BaseDialog extends BaseHTMLElement {
	private _opts?: DialogBaseOpts;

	//// Key Elements
	get dialogEl() { return first(this, '.dialog') };
	get headerEl() { return first(this, '.dialog > header')! };
	get contentEl() { return first(this, '.dialog > section.dialog-content')! };
	get footerEl() { return first(this, '.dialog > footer') };

	//#region    ---------- Data Setters ---------- 
	set opts(v: DialogBaseOpts) {
		// TODO
	};
	set title(title: string) {
		const titleEl = first(this, '.dialog > header > .title');
		if (titleEl) {
			titleEl.textContent = title;
		}
		else {
			console.log('ERROR - cannot set title before element has been initialized');
		}
	}
	set content(content: HTMLElement | DocumentFragment) {
		const contentEl = this.contentEl;
		if (contentEl) {
			contentEl.innerHTML = '';
			contentEl.appendChild(content);
		} else {
			console.log('ERROR - cannot set content before element has been initialized');
		}
	}

	set footer(footer: HTMLElement | DocumentFragment | FooterConfig | boolean) {
		const footerEl = this.footerEl;
		if (!footerEl) {
			console.log('ERROR - cannot set footer before element has been initialized');
			return;
		}
		footerEl.innerHTML = '';

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
	//#endregion ---------- /Data Setters ---------- 

	//#region    ---------- Element Events ----------
	@onEvent('click', '.do-cancel')
	protected async doCancel() {
		trigger(this, 'CANCEL');
		// by default, it will close
		this.doClose();
	}

	@onEvent('click', '.do-ok')
	protected async doOk() {
		trigger(this, 'OK');
		this.doClose();
	}

	@onEvent('click', '.do-extra')
	protected async doExtra() {
		trigger(this, 'EXTRA');
		this.doClose();
	}

	@onEvent('click', '.do-close')
	doClose() {
		this.remove();
	}
	//#endregion ---------- /Element Events ---------- 

	init() {
		super.init();
		this.classList.add('d-base-dialog');
		this.innerHTML = render();
	}


}



//// HTML

function render() {
	return `<div class="dialog">
		<header><span class="title"></span><c-ico class="action do-close">close</c-ico></header>
		<section class="dialog-content"></section>
		<div class="msg hide"></div>
		<footer class="hide"></footer>		
	</div>`;
}