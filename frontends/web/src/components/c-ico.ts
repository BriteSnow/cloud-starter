import { adoptStyleSheet, BaseHTMLElement, css, customElement, html } from 'dom-native';
const { assign } = Object;

//// CSS
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
	
	svg{
		width: 100%;
		height: 100%;
		fill: var(--ico-fill);		
	}
`;


@customElement('c-ico')
class IcoElement extends BaseHTMLElement {
	static _BASE_URL_: string = '/svg/sprite.svg';

	get src() { return this.getAttribute('src') ?? '' };

	constructor() {
		super();
		this.attachShadow({ mode: 'open' }).append(_renderShadow(this.src));
		adoptStyleSheet(this, _compCss);
	}

}



//// Shadow Render
function _renderShadow(src: string) {

	const href = src.startsWith('#') ? `${IcoElement._BASE_URL_}${src}` : src;
	const content = html`
	<svg class="symbol">
	<use xlink:href="${href}" aria-hidden="true"></use>
	</svg>`;

	return content;
}