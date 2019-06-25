// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/frontends/web/src/views/Spec/spec-paths.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { BaseViewClass } from "zold-views/base";
import { SpecTypoView, SpecCardsView, SpecButtonsView, SpecDialogsView, SpecControlsView } from 'zold-views/Spec/SpecViews';

// NOTE: This file is intended to be detached from the origin (above) so that it can list the custom views of the application.

export const specViewByPath: { [name: string]: BaseViewClass } = {
	'typo': SpecTypoView,
	'controls': SpecControlsView,
	'cards': SpecCardsView,
	'buttons': SpecButtonsView,
	'dialogs': SpecDialogsView,
};