
import { StampedEntity } from './entities-base';

export * from './entities-base';

//#region    ---------- Entity Types ---------- 
export type UserType = 'sys' | 'admin' | 'user';

export interface User extends StampedEntity {
	id: number;
	type: UserType;
	username: string;
}

export interface OAuth extends StampedEntity {
	id: number;
	userId: number;
	oauth_token: string;
	oauth_id?: string | null;
	oauth_username?: string;
	oauth_name?: string | null;
	oauth_picture?: string | null;
}

export interface Project extends StampedEntity {
	id: number;
	name: string;
}
//#endregion ---------- /Entity Types ----------
