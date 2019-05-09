require('../../common/ts/setup-module-aliases');
import { queuePop } from 'common/queue';
import { jobManager } from 'common/job-manager';
import { syncLabels, syncIssues } from './github-syncer';

start();

interface ghSyncerMessage {
	projectId: number;
}

async function start() {
	console.log('gh-syncer started');

	for (; true;) {
		let jobId: number | null = null;
		try {
			const job = await jobManager.next('gh-syncer');
			jobId = job.id;
			const projectId = job.data.projectId;

			// do the processing
			await jobManager.state(job.id, 'processing');
			const syncedLabelIds = await syncLabels(projectId);
			const syncedTicketIds = await syncIssues(projectId);

			// complete
			const result = { labelSynced: syncedLabelIds.length, ticketSynced: syncedTicketIds.length };
			await jobManager.complete(job.id, result)

		} catch (ex) {
			console.log(`Error for job ${jobId}`, ex);
			if (jobId != null) {
				jobManager.fail(jobId, ex);
				await jobManager.state(jobId, 'failed');
			}

		}
	}

}