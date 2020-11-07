import { adoptStyleSheets, BaseHTMLElement, css, customElement, html, onDoc, onEvent, trigger } from 'dom-native';
const { assign } = Object;

//// CSS
const _compCss = css`
	:host{
		/* to workaround the need to have * { mid-width: 0 } as the app level and 
		   still allow mid-width customizbility */
		--min-width: 10rem; 
		background: #fff;
		min-width: var(--min-width) !important; 
		position: absolute;
		box-shadow: 0px 3px 3px -2px rgba(0, 0, 0, 0.2),
			0px 3px 4px 0px rgba(0, 0, 0, 0.14),
			0px 1px 8px 0px rgba(0, 0, 0, 0.12);		
		text-transform: none; 
		padding: 0;
		margin: 0;
		display: grid;
		grid-auto-flow: row;
		grid-auto-rows: min-content; /* or max-content */
	}
	
	:host ::slotted(li){
		list-style: none;
		padding: 0 1rem !important;
		margin: 0;
		height: 3rem;
		display: flex;
		align-items: center;
	}
	
	:host ::slotted(li:hover){
		background-color: #ddd;
	}
`;


@customElement('c-menu')
class MenuElement extends BaseHTMLElement {
	/* to avoid having the caller doing a prevent default on click */
	private _acceptDocEvent = false;

	constructor() {
		super();
		adoptStyleSheets(this.attachShadow({ mode: 'open' }), _compCss);
		this.shadowRoot!.append(html`<slot></slot>`);
	}

	postDisplay() {
		this._acceptDocEvent = true;
	}

	//#region    ---------- Section ---------- 
	@onEvent('pointerup')
	onUp() {
		this.close(); // right now remove all the time. 
	}


	// for now, auto close on click outside
	@onDoc('pointerup')
	onDocUp(evt: PointerEvent) {
		if (this._acceptDocEvent) {
			const el = evt.target as HTMLElement;
			const parentEl = el.closest('c-menu');
			if (parentEl == null || parentEl != this) {
				this.close();
			}
		}

	}
	//#endregion ---------- /Section ---------- 

	close() {
		trigger(this, 'CLOSE');
		this.remove();
	}
}





