import { on, display, first } from 'mvdom';
import { initRoute } from './route';
import { MainView } from 'views/MainView';
import { ajaxGet } from 'ts/ajax';
import { LoginView } from 'views/LoginView';
import { getUserContext } from 'ts/user-ctx';


on(document, 'APP_LOADED', async function () {

	const uc = await getUserContext();
	// if no UC, we display the LoginView

	if (!uc) {
		display(new LoginView(), 'body', 'empty');
	} else {
		// then add this new MainView
		display(new MainView(uc), first('body')!).then(function () {
			// initialize the route, which will trigger a "CHANGE" on the routeHub hub. 
			// Note: we do that once the MainView has been added to the DOM so that it can react accordingly
			initRoute();
		});
	}


});
