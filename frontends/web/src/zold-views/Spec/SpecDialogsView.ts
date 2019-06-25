// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/frontends/web/src/views/Spec/SpecDialogsView.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { BaseView, addDomEvents } from "zold-views/base";
import { display, frag } from "mvdom";
import { DialogBase } from "zold-views/Dialog/DialogBase";


export class SpecDialogsView extends BaseView {

	events = addDomEvents(this.events, {

		'click; .show-dialog2': async (evt) => {
			const dialog = new DialogBase();
			dialog.title = 'Dialog 2';
			dialog.content = frag('<div>Dialog 2 Content</div>');
			await display(dialog, 'body');
		}

	});

}