import { first, on, trigger } from 'mvdom';
import { ajaxGet } from 'ts/ajax';
import { getUserContext } from 'ts/user-ctx';
import { MainView } from 'views/v-main';



// --------- Load Resources --------- //
//// Prepare the resource to be loaded before starting the application
// NOTE: We start the loading as soon as possible (before the DOMContentLoaded)
var svgSymbolsPromise = ajaxGet("/svg/sprite.svg", null, { contentType: "application/xml" });

document.addEventListener("DOMContentLoaded", function (event) {

	// we make sure the the ajax for the svg/sprites.svg returns
	svgSymbolsPromise.then(function (xmlDoc) {
		// add the symbols to the head (external linking works but has issues - styling, and caching -)
		var firstChildElement = xmlDoc.firstChildElement || xmlDoc.childNodes[0]; // edge does not seem to have .firstChildElement, at least for xlmDoc
		var h = document.querySelector("head");

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

		// // then add this new MainView
		// display(new MainView(uc), first('body')!).then(function () {
		// 	// initialize the route, which will trigger a "CHANGE" on the routeHub hub. 
		// 	// Note: we do that once the MainView has been added to the DOM so that it can react accordingly
		// 	initRoute();
		// });
	}

});
//#endregion ---------- /Start The Application ----------


