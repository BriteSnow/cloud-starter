import { ajaxGet } from 'base/ajax';
import { getUserContext } from 'base/user-ctx';
import { first, on, trigger } from 'mvdom';
import 'mvdom-ui'; // import all mvdom-ui
import { defaultIcons } from 'mvdom-ui';
import { MainView } from 'views/v-main';

window.__version__ = "DROP-002-SNAPSHOT";

// --------- Load Resources --------- //

// load the default mvdom-ui icon set
defaultIcons.load();

//// Prepare the resource to be loaded before starting the application
// NOTE: We start the loading as soon as possible (before the DOMContentLoaded)
const svgSymbolsPromise = ajaxGet("/svg/sprite.svg", null, { contentType: "application/xml" });

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

// --------- /Load Resources --------- //	

//#region    ---------- Start The Application ---------- 
//// Start the application 
on(document, 'APP_LOADED', async function () {

	const uc = await getUserContext();
	// if no UC, we display the LoginView

	if (!uc) {
		// display(new LoginView(), 'body', 'empty');
		document.body.innerHTML = '<v-login></v-login>';
	} else {
		document.body.innerHTML = '<v-main></v-main>';
		const mainView = first(document.body) as MainView;
		mainView.userContext = uc;

	}

});
//#endregion ---------- /Start The Application ----------


