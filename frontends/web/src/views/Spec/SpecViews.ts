import { BaseView, addDomEvents } from '../base';
import { push, pull, first } from 'mvdom';

export class SpecTypoView extends BaseView {

}

export class SpecCardsView extends BaseView {

}

export class SpecButtonsView extends BaseView {

}

export class SpecControlsView extends BaseView {
	events = addDomEvents(this.events, {

		'CHANGE, c-field': async (evt) => {
			console.log('.c-field CHANGE evt.detail', evt.detail);
		},

		// just simple test
		'click; .spec-form .do-push': async (evt) => {
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


export { SpecDialogsView } from './SpecDialogsView';


