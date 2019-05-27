
import { StampedEntity } from './entities-base';

export * from './entities-base';

//#region    ---------- Entity Types ---------- 

export interface User extends StampedEntity {
	id: number;
	type: 'sys' | 'admin' | 'user';
	username: string;
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
