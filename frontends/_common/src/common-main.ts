import '@dom-native/ui';
import { defaultIcons } from '@dom-native/ui';
import { trigger } from 'dom-native';
import { webGet } from './web-request.js';


window.__version__ = "DROP-004";

//#region    ---------- Initialize DOM ---------- 
// load the default @dom-native/ui icon set
defaultIcons.load();

//// Prepare the resource to be loaded before starting the application
// NOTE: We start the loading as soon as possible (before the DOMContentLoaded)
const svgSymbolsPromise = webGet("/svg/sprite.svg", { contentType: "application/xml" });

document.addEventListener("DOMContentLoaded", function (event) {
	// we make sure the the ajax for the svg/sprites.svg returns
	svgSymbolsPromise.then(function (xmlDoc) {
		// add the symbols to the head (external linking works but has issues - styling, and caching -)
		const firstChildElement = xmlDoc.firstChildElement || xmlDoc.childNodes[0]; // edge does not seem to have .firstChildElement, at least for xlmDoc
		const h = document.querySelector("head");

		if (h != null) {
			h.appendChild(firstChildElement);
		}

		// trigger an APP_LOADED event on document once everything is ready to start the app. 
		trigger(document, "APP_LOADED");

	});
});
//#endregion ---------- /Initialize DOM ----------