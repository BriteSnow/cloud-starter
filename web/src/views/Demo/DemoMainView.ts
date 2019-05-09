import { BaseView, BaseViewClass, addHubEvents, RouteInfo } from 'views/base';
import { display, first, all } from 'mvdom';
import { DemoTypoView, DemoCardsView, DemoButtonsView, DemoDialogsView, DemoControlsView } from 'views/Demo/DemoViews';
import { pathAt } from 'ts/route';


const defaultPath = 'typo';

const pathToView: { [name: string]: BaseViewClass } = {
	'typo': DemoTypoView,
	'cards': DemoCardsView,
	'buttons': DemoButtonsView,
	'dialogs': DemoDialogsView,
	'controls': DemoControlsView
};

export class DemoMainView extends BaseView {

	protected get main() { return first(this.el, 'section.content')! }

	hubEvents = addHubEvents(this.hubEvents, {
		// 'routeHub' is the hub receiving url changes
		'routeHub; CHANGE': () => {
			this.displayView();
		},
	});

	postDisplay() {
		this.displayView();
	}


	private displayView() {
		const newPath = this.hasNewPathAt(1, defaultPath);
		// update this view/content only if the path has changed
		if (newPath != null) {
			const subViewClass = pathToView[newPath];
			display(new subViewClass, this.main, 'empty');

			// update the tab
			const href = `/_ui/${newPath}`;
			for (const tab of all(this.el, '.tab-bar a')) {
				const tabHref = tab.getAttribute('href');
				if (tab.classList.contains('sel') && tabHref !== href) {
					tab.classList.remove('sel');
				} else if (tabHref === href) {
					tab.classList.add('sel');
				}
			}
		}
	}
}