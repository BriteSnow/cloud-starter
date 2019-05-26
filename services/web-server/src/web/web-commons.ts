import { projectDao } from 'common/da/daos';
import { Project } from 'shared/entities';
import { Request } from '../express-utils';

/** Get the projectId from reques, and get the Project object */
export async function getProjectFromReq(req: Request): Promise<Partial<Project>> {
	const projectId = req.query.projectId;

	// guard if no project id
	if (projectId == null) {
		throw new Error(`Cannot list tickets because now 'projectId' query param provided`)
	}
	const project = projectDao.get(req.context, projectId);
	return project;
}
