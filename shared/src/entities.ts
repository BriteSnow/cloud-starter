
//#region    ---------- Entity Related Types ---------- 
export interface Filter<E> {
	matching?: Partial<E>;
	ids?: number[];
}

export interface ProjectEntityFilter<E> extends Filter<E> {
	projectId: number;
}

export interface TicketFilter extends ProjectEntityFilter<Ticket> {
	labelIds?: number[];
}

//#endregion ---------- /Entity Related Types ---------- 

//#region    ---------- BaseEntities ---------- 
export interface StampedEntity {
	cid?: number,
	ctime?: string,
	mid?: number,
	mtime?: string
}

interface ProjectEntity extends StampedEntity {
	projectId: number;
}
//#endregion ---------- /BaseEntities ---------- 


//#region    ---------- Entity Types ---------- 

export interface User extends StampedEntity {
	id: number;
	type: 'sys' | 'admin' | 'user';
	username: string;
	pwd?: string;
}

export interface OAuth { // OAuth does ot need to be stamped
	id: number;
	userId: number;
	token?: string;
}

export type JobState = 'new' | 'queued' | 'processing' | 'completed' | 'failed'; // same as db job_state enum

export interface Job {
	id: number,
	name: string,
	newTime: string,
	queuedTime: string,
	processingTime: string,
	completedTime: string,
	failedTime: string,
	state: JobState,
	data: any,
	result: any,
	error: string
}

export interface Project extends StampedEntity {
	id: number;
	name: string;
	ghId?: number;
	ghName?: string;
	ghFullName?: string;
}

export interface Ticket extends ProjectEntity {

	//// db properties
	id: number;
	title: string;
	ghId?: number;
	ghTitle?: string;
	ghNumber?: number;

	//// transient properties
	labels?: { id: number, name: string, color: string, luma?: number, isDark?: boolean }[];
}


export interface Label extends ProjectEntity {
	id: number;
	name: string;
	color: string;
	ghId?: number;
	ghColor?: string;
}

export interface TicketLabel extends StampedEntity {
	ticketId: number;
	labelId: number;
}



export interface Pane extends ProjectEntity {
	id: number;
	name: string;
	labelIds?: number[];
}
//#endregion ---------- /Entity Types ---------- 
