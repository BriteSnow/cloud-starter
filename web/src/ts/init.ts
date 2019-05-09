import { trigger } from 'mvdom';
import { ajaxGet } from './ajax';

// --------- Load svg icons --------- //
// NOTE: We start the loading as soon as possible (before the DOMContentLoaded)
var svgSymbolsPromise = ajaxGet("/svg/sprite.svg", null, { contentType: "application/xml" });
// --------- /Load svg icons --------- //	


document.addEventListener("DOMContentLoaded", function (event) {

	// we make sure the the ajax for the svg/sprites.svg returns
	svgSymbolsPromise.then(function (xmlDoc) {
		// add the symbols to the head (external linking works but has issues - styling, and caching -)
		var firstChildElement = xmlDoc.firstChildElement || xmlDoc.childNodes[0]; // edge does not seem to have .firstChildElement, at least for xlmDoc
		var h = document.querySelector("head");

		if (h != null) {
			h.appendChild(firstChildElement);
		}

		// trigger an event that the application has been loaded
		trigger(document, "APP_LOADED");

	});
});
