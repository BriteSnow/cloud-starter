import { adoptStyleSheets, BaseHTMLElement, css, customElement, html, onEvent } from 'dom-native';


const _compCss = css`
	:host{
		z-index: 100;
		position: absolute;
		top: 0; bottom: 0; right: 0; left: 0;
		display: flex;
		align-items: center;
		pointer-events: none;
	}

	:host .popup{
		pointer-events: auto;
		position: absolute;
		top: 300px;
		left: 50%;
		padding: 2rem 0;
		margin-left: -10rem;
		width: 20rem;
		/* height: 8rem; */
		background: #333;	
		display: grid;
		grid-template-columns: 2rem 1fr 2rem 1rem;
	}
	
	:host .message{
		grid-column: 2 / span 1;
		display: flex;
		align-items: center;
		color: white;
	}
	
	:host svg{
		width: 1rem;
		height: 1rem;
		fill: white;
	}
	
	:host c-ico.action-close{
		--ico-fill: white;
		width: 2rem;
		height: 2rem;
		cursor: pointer;
	}
`;



@customElement('p-notif')
class NotificationPopup extends BaseHTMLElement {

	constructor() {
		super();

		const content = html`
			<div class="popup" >
				<div class="message"><slot>message place holder</slot></div>
				<c-ico class="action-close" name="ico-close"></c-ico>
			</div>
		`;

		adoptStyleSheets(this.attachShadow({ mode: 'open' }), _compCss).append(content);
	}

	@onEvent('pointerup', '.action-close')
	onCloseClick() {
		this.remove();
	}
}






