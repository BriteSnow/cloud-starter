import 'common/common-main';
import { getUserContext } from 'common/user-ctx.js';
import { on, trigger } from 'dom-native';

// NOT IMPLEMENTED YET, JUST SKELETON. 

on(document, 'DOMContentLoaded', function () {
	trigger(document, 'APP_LOADED');
});

//#region    ---------- Start Application ---------- 
//// Start the application 
on(document, 'APP_LOADED', async function () {

	const uc = await getUserContext();
	// if no UC, we display the LoginView

	if (!uc) {
		document.body.innerHTML = '<v-admin-login></v-admin-login>';
	} else {
		document.body.innerHTML = 'LOGGED IN';
	}

});
//#endregion ---------- /Start Application ----------

