import { css } from 'common/dom-utils';
import { BaseHTMLElement, customElement, elem, frag } from 'dom-native';
const { assign } = Object;


@customElement('c-ico')
class IcoElement extends BaseHTMLElement {
	static _BASE_URL_: string = '/svg/sprite.svg';

	get src() { return this.getAttribute('src') ?? '' };

	constructor() {
		super();
		this.attachShadow({ mode: 'open' }).append(_renderShadow(this.src));
	}

}

//// CSS
let _compStyle: HTMLElement | undefined;
const _compCss = css`
	:host{
		--ico-fill: black;
		text-transform: none; 
		padding: 0;
		margin: 0;
		width: 1rem;
		height: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		user-select: none;
	}
	
	:host svg{
		width: 100%;
		height: 100%;
		fill: var(--ico-fill);		
	}
`;

//// Shadow Render
function _renderShadow(src: string) {

	const href = src.startsWith('#') ? `${IcoElement._BASE_URL_}${src}` : src;
	const _shadowFrag = frag(`
	<svg class="symbol">
	<use xlink:href="${href}" aria-hidden="true"></use>
	</svg>`);

	_compStyle ??= assign(elem('style'), { innerHTML: _compCss });
	_shadowFrag.prepend(_compStyle.cloneNode(true));

	return _shadowFrag;
}