// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/frontends/web/src/views/Spec/SpecControlsView.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { BaseView, addDomEvents } from "zold-views/base";
import { push, pull } from "mvdom";
import { wait } from "shared/utils";

export class SpecControlsView extends BaseView {
	events = addDomEvents(this.events, {

		'CHANGE; .c-field': async (evt) => {
			console.log('.c-field CHANGE evt.detail', evt.detail);
		},

		'DATA; c-select[name="fieldK"]': async (evt) => {
			await wait(1000); // test delay 
			const data = [
				{ value: '0', content: 'value 0' },
				{ value: 'K', content: 'value K' },
				{ value: '1', content: 'value 1' }
			];
			for (let i = 2; i < 30; i++) {
				data.push({ value: `${i}`, content: `value ${i}` });
			}
			evt.detail.sendData(data);
		},

		// test c-inputs
		'click; .spec-inputs .do-push': async (evt) => {
			const container = evt.selectTarget.closest('.card')! as HTMLElement;

			const beforeData = pull(container);
			console.log('Before Push Data:', beforeData);

			const data = {
				fieldA: null,
				fieldB: 123,
				fieldC: true,
				fieldD: false
			}
			push(container, data);

			const afterData = pull(container);
			console.log('After Push Data:', afterData);
		},

		// test c-inputs
		'click; .spec-checks .do-push': async (evt) => {
			const container = evt.selectTarget.closest('.card')! as HTMLElement;

			const beforeData = pull(container);
			console.log('Before Push Data:', beforeData);

			const data = {
				fieldD: false,
				fieldE: true,
				fieldF: 'value F'
			}
			push(container, data);

			const afterData = pull(container);
			console.log('After Push Data:', afterData);
		},

		// just simple test
		'click; .spec-options .do-push': async (evt) => {
			const container = evt.selectTarget.closest('.card')! as HTMLElement;

			const beforeData = pull(container);
			console.log('Before Push Data:', beforeData);

			const data = {
				state: '1'
			}
			push(container, data);

			const afterData = pull(container);
			console.log('After Push Data:', afterData);
		}

	});
}
