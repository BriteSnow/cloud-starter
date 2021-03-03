import { userDao } from '../da/daos';
import { getSysContext } from '../user-context';
import { AppRouter, assertApiKtx, Ktx, routeGet } from './koa-utils';

/**
 * Note: since we do not know if this request is auth or not, just use AppRouter and then, assert ktx for ApiKtx
 */
class ApiUserContextRouter extends AppRouter {
	@routeGet('/user-context')
	async userContext(ktx: Ktx) {
		const sysCtx = await getSysContext();

		try {
			assertApiKtx(ktx);
			const user = await userDao.get(sysCtx, ktx.state.utx.userId);
			const name = user.username; // for now the display name will be the user name
			return { success: true, data: { id: user.id, name, username: user.username } };
		} catch (ex) {
			return { success: false };
		}
	}
}


export default function apiUtxRouter(prefix?: string) { return new ApiUserContextRouter(prefix) };