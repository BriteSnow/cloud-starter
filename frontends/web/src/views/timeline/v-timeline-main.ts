import { activateDrag, draggable } from '@dom-native/dnd';
import { BaseViewElement } from 'common/v-base';
import { customElement, OnEvent, onEvent } from 'dom-native';


@customElement('v-timeline-main')
export class TimelineMainView extends BaseViewElement {

	//// key elements
	get tmZoomEl() { return this.cacheFirst('tm-zoom')! };
	get tmPlayEl() { return this.cacheFirst('tm-play')! };
	get tmPlayHeadEl() { return this.cacheFirst('tm-play .tm-head')! };


	@onEvent('pointerdown', 'tm-zoom .tm-head')
	onTmMarkerPointerDown(evt: PointerEvent & OnEvent) {
		const headEl = evt.selectTarget;

		const tmPlayRect = this.tmPlayEl.getBoundingClientRect();
		const tmZoomRect = this.tmZoomEl.getBoundingClientRect();

		activateDrag(headEl, evt, {
			drag: 'source',
			constraints: {
				y: false,
				container: 'tm-zoom'
			},
			onDrag: (evt) => {
				const pointerEvent = evt.detail.pointerEvent;
				const left = pointerEvent.clientX - tmZoomRect.left;
				console.log('->> ', left, left / tmZoomRect.width * 100);
			}
		});

	}

	async init() {
		this.innerHTML = _render();
	}

	postDisplay() {
		draggable(this, 'tm-play', {
			drag: 'none',
			onDragStart: (evt) => {

			}
		});
	}
}

//// HTMLs

function _render() {
	let html = `
	<header>
	<h1>Timelines</h1>
	</header>
	<section class="content">
		<div class="sandbox">
			<tm-timeline>
			
				<tm-play>
					<d-ico name="ico-t-down" class="tm-head"></d-ico>
					<tm-bar>
					<tm-zone></tm-zone>
					</tm-bar>
					
				</tm-play>
				
				<tm-zoom>
					<d-ico name="ico-t-down" class="tm-head"></d-ico>
					<tm-bar class="active"></tm-bar>
				</tm-zoom>
				
				<div class="spacer"></div>

				<tm-layer>
					<tm-header>Layer A</tm-header>
					<tm-body>
						<tm-item label="annotation item" type="span" start="12:003" end="14:004"></tm-item>
						<tm-item label="annotation item" type="point" start="15:450"></tm-item>
					</tm-body>
				</tm-layer>

			</tm-timeline>
		</div>
	</section>
`;

	return html;

}