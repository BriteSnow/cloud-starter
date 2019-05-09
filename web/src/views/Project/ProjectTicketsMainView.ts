import { BaseView } from 'views/base';

export class ProjectTicketsMainView extends BaseView {
	projectId: number;

	constructor(projectId: number) {
		super();
		this.projectId = projectId;
	}
}