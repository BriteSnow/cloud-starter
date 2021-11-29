import { wksDao } from 'common/da/daos.js';
import { ApiKtx } from 'common/web/koa-utils.js';
import { Wks } from 'shared/entities.js';
import { asNum } from 'utils-min';

/** Get the wksId from reques, and get the Wks object */
export async function getWksFromReq(ktx: ApiKtx): Promise<Partial<Wks>> {
	const ctx = ktx.state.utx;
	const qWksId = ktx.query.wksId;
	const wksId = asNum((typeof qWksId == 'string') ? qWksId : null);

	// guard if no wks id
	if (wksId == null) {
		throw new Error(`Cannot list tickets because now 'wksId' query param provided`)
	}
	const wks = wksDao.get(ctx, wksId);
	return wks;
}