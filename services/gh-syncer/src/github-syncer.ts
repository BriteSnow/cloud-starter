
import { getIssues, getLabels } from 'common/service/github';
import { ticketDao, projectDao, labelDao, ticketLabelDao, userDao, oauthDao } from 'common/da/daos';
import { Ticket, Label } from 'shared/entities';
import { getSysContext } from 'common/context';


export async function syncLabels(projectId: number) {
	const ctx = await getSysContext();

	const syncedIds: number[] = [];

	const project = await projectDao.get(ctx, projectId);

	// guard against missing github nmae
	if (!project.ghFullName) {
		throw new Error(`Cannot sync github labels for project ${project.id} ${project.name} as it not linked to a github repo`);
	}

	const access_token = await getAccessToken(project.id);

	// get the github and db labels in parallel
	const ghLabelsP = getLabels(access_token, project.ghFullName);
	const labelsP = labelDao.list(ctx, { projectId });

	// wait for both of them
	const [ghLabels, labels] = await Promise.all([ghLabelsP, labelsP]);

	// build a map of existing db label per ghId
	const labelByGhId = new Map(labels.map((l): [number, Label] => [l.ghId!, l]));

	for (const ghLabel of ghLabels) {
		if (labelByGhId.get(ghLabel.id) == null) {
			const name = (ghLabel.name) ? (<string>ghLabel.name).substring(0, 127) : `NO NAME LABEL (${ghLabel.id})`;
			// FIXME: for now hardcode to exlude "IN-DROP..."
			if (name.startsWith("IN-DROP")) {
				continue;
			}
			const newLabelData: Partial<Label> = {
				name,
				projectId,
				color: ghLabel.color || 'eeeeff',
				ghId: ghLabel.id,
				ghColor: ghLabel.color
			}

			const labelId = await labelDao.create(ctx, newLabelData);
			syncedIds.push(labelId)
		}
	}
	return syncedIds;
}

export async function syncIssues(projectId: number) {
	const ctx = await getSysContext();

	const syncedIds: number[] = [];

	const project = await projectDao.get(ctx, projectId);

	const access_token = await getAccessToken(project.id);


	if (!project.ghFullName) {
		throw new Error(`Cannot sync github issues for project ${project.id} ${project.name} as it not linked to a github repo`);
	}

	// We get the github issues from the API and the tickets from the db
	// Note: We can do that in parallel and then wait for both to resolve
	const labelsP = labelDao.list(ctx, { projectId });
	const issuesP = await getIssues(access_token, project.ghFullName);
	const ticketsP = await ticketDao.list(ctx, { projectId });

	// Wait for both to be resolved
	// Note: Here the types will be correctly inferred!!
	const [issues, tickets, labels] = await Promise.all([issuesP, ticketsP, labelsP]);

	const labelByGhId = new Map(labels.map((l): [number, Label] => [l.ghId!, l]));

	// put the tickets in a map by ghId
	const ticketByGhId = new Map(tickets.map((t): [number, Ticket] => [t.ghId!, t]));

	for (const issue of issues) {
		if (ticketByGhId.get(issue.id) == null) {
			let title = issue.title as string;
			title = title.substring(0, 127);

			const newTicketData: Partial<Ticket> = {
				projectId,
				title,
				ghId: issue.id,
				ghTitle: title,
				ghNumber: issue.number
			}
			const ticketId = await ticketDao.create(ctx, newTicketData);

			if (issue.labels) {
				for (const ghLabel of issue.labels) {
					const label = labelByGhId.get(ghLabel.id);
					if (label) {
						await ticketLabelDao.create(ctx, { ticketId, labelId: label.id })
					}
				}
			}

			syncedIds.push(ticketId);


		}
	}

	return syncedIds;
}

/**
 * Get the access token for a project (without any specific user). 
 * For now, it take the first owner of this project and return it's access token.
 */
async function getAccessToken(projectId: number): Promise<string> {
	const sysCtx = await getSysContext();

	const owners = await projectDao.getOwners(sysCtx, projectId);

	// guard against now owners
	if (owners.length === 0) {
		throw new Error(`Cannot get access_token for project ${projectId} because it does not have any owner`);
	}

	// get the first oauth
	const firstOwner = owners[0];
	const oauth = await oauthDao.first(sysCtx, { userId: firstOwner.id });

	// guard against missing token
	if (!oauth || !oauth.token) {
		throw new Error(`Cannot get access_token for project ${projectId} because owner ${firstOwner.id} does not have a access_token`)
	}

	return oauth.token

}