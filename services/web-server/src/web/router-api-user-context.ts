import { getSysContext } from 'common/context';
import { userDao } from 'common/da/daos';
import { srouter } from '../express-utils';

const _router = srouter();

_router.get('/user-context', async function (req, res, next) {
	const sysCtx = await getSysContext();

	try {
		const user = await userDao.get(sysCtx, req.context.userId);
		const name = user.username; // for now the display name will be the user name
		return { success: true, data: { id: user.id, name, username: user.username } };
	} catch (ex) {
		return { success: false };
	}

});


export const routerApiUserContext = _router;