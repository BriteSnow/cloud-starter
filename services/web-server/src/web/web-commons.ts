import { projectDao } from 'common/da/daos';
import { Project } from 'shared/entities';
import { ApiKtx } from './koa-utils';

/** Get the projectId from reques, and get the Project object */
export async function getProjectFromReq(ktx: ApiKtx): Promise<Partial<Project>> {
	const ctx = ktx.state.utx;

	const projectId = ktx.query.projectId;

	// guard if no project id
	if (projectId == null) {
		throw new Error(`Cannot list tickets because now 'projectId' query param provided`)
	}
	const project = projectDao.get(ctx, projectId);
	return project;
}
