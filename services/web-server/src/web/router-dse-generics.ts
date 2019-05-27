
import { srouter } from '../express-utils';
import { daoByEntity } from 'common/da/daos';

const _router = srouter();

/// This module creates the base dse (Data Service Endpoint) crud methods that will be used as fall back if not overriden
/// All of the generic crud methods use the appropriate entity daos, which already give a layer of specificity.

// LIST entity
_router.get('/dse/:type', async function (req, res, next) {
	const type = req.params.type;
	const dao = daoByEntity[type];

	let queryOptions: any = {};
	if (req.query.wksId != null) {
		queryOptions.wksId = req.query.wksId;
	}
	if (req.query.matching) {
		queryOptions.matching = JSON.parse(req.query.matching);
	}

	const entities = await dao.list(req.context, queryOptions);

	return { success: true, data: entities };
});

// GET entity
_router.get('/dse/:type/:id', async function (req, res, next) {
	const type = req.params.type;
	const dao = daoByEntity[type];

	const id = parseInt(req.params.id);


	const entity = await dao.get(req.context, id);

	return { success: true, data: entity };
});

// CREATE entity
_router.post('/dse/:type', async function (req, res, next) {
	const type = req.params.type;
	const dao = daoByEntity[type];

	const data = req.body;
	const id = await dao.create(req.context, data);
	const entity = await dao.get(req.context, id);

	return { success: true, data: entity };
});


// PATCH entity
// Note: Update the entity, will send only the partial properties that have to be updated. 
_router.patch('/dse/:type/:id', async function (req, res, next) {
	const ctx = req.context;
	const type = req.params.type;
	const id = parseInt(req.params.id);
	const dao = daoByEntity[type];

	const data = req.body;
	await dao.update(ctx, id, data);
	const entity = await dao.get(ctx, id);

	return { success: true, data: entity };
});

// DELETE entity
_router.delete('/dse/:type/:id', async function (req, res, next) {
	const ctx = req.context;
	const type = req.params.type;
	const id = parseInt(req.params.id);
	const dao = daoByEntity[type];

	await dao.remove(ctx, id);

	return { success: true };
});


export const routerDseGenerics = _router;