// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/frontends/web/src/views/Spec/SpecMainView.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { all, display, first } from 'mvdom';
import { addHubEvents, BaseView } from 'zold-views/base';
import { specViewByPath } from './spec-paths';



const defaultPath = 'typo';

export class SpecMainView extends BaseView {

	data = { paths: Object.keys(specViewByPath) };

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
			const subViewClass = specViewByPath[newPath];
			display(new subViewClass, this.main, 'empty');

			// update the tab
			const href = `/_spec/${newPath}`;
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