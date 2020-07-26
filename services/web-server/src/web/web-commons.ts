import { wksDao } from 'common/da/daos';
import { Wks } from 'shared/entities';
import { ApiKtx } from './koa-utils';

/** Get the wksId from reques, and get the Wks object */
export async function getWksFromReq(ktx: ApiKtx): Promise<Partial<Wks>> {
	const ctx = ktx.state.utx;

	const wksId = ktx.query.wksId;

	// guard if no wks id
	if (wksId == null) {
		throw new Error(`Cannot list tickets because now 'wksId' query param provided`)
	}
	const wks = wksDao.get(ctx, wksId);
	return wks;
}
