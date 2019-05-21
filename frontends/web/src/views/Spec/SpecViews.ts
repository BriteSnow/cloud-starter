import { BaseView, addDomEvents } from '../base';
import { push, pull } from 'mvdom';

export class SpecTypoView extends BaseView {

}

export class SpecCardsView extends BaseView {

}

export class SpecButtonsView extends BaseView {

}

export class SpecControlsView extends BaseView {
	events = addDomEvents(this.events, {
		// just simple test
		'click; .do-push-data': async (evt) => {
			const data = {
				fieldA: null,
				fieldB: 123
			}
			push(this.el, data);

			const newData = pull(this.el);
			console.log(newData);
		}

	});
}


export { SpecDialogsView } from './SpecDialogsView';


