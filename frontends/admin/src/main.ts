import 'common/common-main';
import { getUserContext } from 'common/user-ctx';
import { on } from 'dom-native';


//#region    ---------- Start Application ---------- 
//// Start the application 
on(document, 'APP_LOADED', async function () {

	const uc = await getUserContext();
	// if no UC, we display the LoginView

	if (!uc) {
	} else {
	}

});
//#endregion ---------- /Start Application ----------


