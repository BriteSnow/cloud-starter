// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/frontends/web/src/views/spec/spec-views.ts" />

import { BaseHTMLElement, customElement, frag, onEvent } from 'mvdom';
import { render } from 'ts/render';
import { BaseDialog } from 'views/dialog/d-base-dialog';
import { elem } from 'mvdom-xp';

export class BaseSpecView extends BaseHTMLElement {

	// By default, the spec views will render their inner content 
	// with the template named after their tagName
	init() {
		super.init();
		this.innerHTML = '';
		this.appendChild(render(this.tagName.toLowerCase()));
	}
}

@customElement('spec-typo')
class SpecTypoView extends BaseSpecView { }


@customElement('dialog-two')
class DialogTwo extends BaseDialog {

	init() {
		super.init();
		this.title = 'Dialog 2';
		this.content = frag('<div>Dialog 2 Content</div>');
		this.footer = true;
	}
}

@customElement('spec-dialogs')
class SpecDialogsView extends BaseSpecView {

	@onEvent('click', '.show-dialog2')
	showDialog() {
		document.body.appendChild(elem('dialog-two'));
	}
}

@customElement('spec-cards')
class SpecCardsView extends BaseSpecView { }

@customElement('spec-buttons')
class SpecButtonsView extends BaseSpecView { }

