
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

export interface OAuth extends StampedEntity {
	id: number;
	userId: number;
	oauth_token: string;
	oauth_id?: string;
	oauth_username?: string;
	oauth_name?: string;
	oauth_picture?: string;
}

export interface Project extends StampedEntity {
	id: number;
	name: string;
}
//#endregion ---------- /Entity Types ----------
