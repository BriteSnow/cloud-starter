
import { srouter } from '../express-utils';
import { ticketDao, Project } from 'common/da/daos';

const _router = srouter();

const entityType = 'Ticket'; // normalize parametirazation accross crud overrides.


// list the entities, require query.projectId
_router.get(`/crud/${entityType}`, async function (req, res, next) {
	const projectId = req.query.projectId;
	const labelIds = (req.query.labelIds) ? JSON.parse(req.query.labelIds) : undefined;

	if (projectId == null) {
		throw new Error(`Cannot list tickets, 'projectId' request param missing`);
	}

	const data = await ticketDao.list(req.context, { projectId, labelIds });

	return { success: true, data };
});


export const router = _router;


