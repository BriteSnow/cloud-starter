import { BaseHTMLElement, customElement } from 'mvdom-xp';
import { render } from 'ts/render';

class BaseSpecView extends BaseHTMLElement {

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

@customElement('spec-controls')
class SpecControlsView extends BaseSpecView { }

@customElement('spec-dialogs')
class SpecDialogsView extends BaseSpecView { }

@customElement('spec-cards')
class SpecCardsView extends BaseSpecView { }

@customElement('spec-buttons')
class SpecButtonsView extends BaseSpecView { }

