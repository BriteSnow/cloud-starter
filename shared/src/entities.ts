
export interface QueryOptions<E> {
	matching?: Partial<E>;
	ids?: number[];
	orderBy?: string;
}


//#region    ---------- BaseEntities ---------- 
export interface StampedEntity {
	cid?: number,
	ctime?: string,
	mid?: number,
	mtime?: string
}

interface ProjectBasedEntity extends StampedEntity {
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

export interface Project extends StampedEntity {
	id: number;
	name: string;
}
//#endregion ---------- /Entity Types ----------
