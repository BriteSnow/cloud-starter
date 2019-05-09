

import { srouter } from '../express-utils';
import { getUserRepos, getRepo } from 'common/service/github';
import { projectDao, paneDao } from 'common/da/daos';
import { Project } from 'shared/entities';
import { jobManager } from 'common/job-manager';

const _router = srouter();


_router.get('/github/repos', async function (req, res, next) {
	const access_token = (await req.context.getAccessToken())!;
	const repos = await getUserRepos(access_token);
	return { success: true, data: repos };

});



_router.post('/github/import-repo', async function (req, res, next) {
	const repoName = req.body.repo;
	const ctx = req.context;

	try {
		const access_token = (await req.context.getAccessToken())!;
		const repo = await getRepo(access_token, repoName);

		const projectData: Partial<Project> = {
			name: repo.name,
			ghId: repo.id,
			ghName: repo.name,
			ghFullName: repo.full_name,
		}

		const projectId = await projectDao.create(ctx, projectData);
		const newProject = await projectDao.get(ctx, projectId);

		// create the first pane. 
		await paneDao.create(ctx, { projectId, name: "All Open" });

		// start a new gh-syncer job for this project
		await jobManager.start('gh-syncer', { projectId });

		return { success: true, data: newProject };

	} catch (ex) {
		throw new Error(`Cannot import github repo '${repoName}'. Cause: ` + ex);
	}

});

_router.post('/github/sync', async function (req, res, next) {

	const projectId = (req.body.projectId) ? parseInt(req.body.projectId) : null;
	if (projectId == null) {
		throw new Error("Cannot sync because no projectId in post request ");
	}

	await jobManager.start('gh-syncer', { projectId });

	return { success: true };

});


export const router = _router;