
import { ProjectAccesses } from './access-types';
import { StampedEntity } from './entities-base';

export * from './entities-base';


//#region    ---------- User ---------- 
// Default user columns (more defined in dao-user for auth, login, ...)
export const USER_COLUMNS = Object.freeze(['id', 'uuid', 'username', 'cid', 'ctime', 'mid', 'mtime'] as const);
type UserPropName = typeof USER_COLUMNS[number];

// postgres enum user_type

export interface User extends StampedEntity {
	id: number;
	uuid: string;
	username: string;
}
//#endregion ---------- /User ---------- 


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
	accesses?: ProjectAccesses
}
