import 'common/common-main';
import { getUserContext } from 'common/user-ctx.js';
import { first, on } from 'dom-native';
import { MainView } from 'views/v-main.js';

//#region    ---------- Start Application ---------- 
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
//#endregion ---------- /Start Application ----------

