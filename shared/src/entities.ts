
import { WksAccesses } from './access-types.js';
import { StampedEntity } from './entities-base.js';
import { JobEventName } from './event-types.js';

export * from './entities-base.js';


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

export interface Wks extends StampedEntity {
	id: number;
	uuid: string;
	name: string;
	accesses?: WksAccesses
}

export interface WksScopedEntity {
	wksId: number;
}

//#region    ---------- Media ---------- 
export type MediaType = 'video' | 'image';
export type MediaResolution = '480p30' | '360p30';

export interface Media extends StampedEntity, WksScopedEntity {
	id: number;
	type: MediaType;
	uuid: string;
	srcName: string; // the orginal source name
	name: string; // the name of the main media file (can have different extension as srcName)
	folderPath: string; // from after the contentRoot
	sd: MediaResolution;

	url: string; // set by MediaDao.parseRecord
	sdUrl?: string; // set by MediaDao.parseRecord
}
//#endregion ---------- /Media ---------- 

//#region    ---------- Job ---------- 
export type JobState = 'new' | 'started' | 'completed' | 'skipped' | 'failed';

export interface Job {
	id: number,
	state: JobState,

	event: JobEventName,

	wksId?: number, // can be undefined when not for a workspace
	onEntity?: string, // the entity type name e.g., "Media"
	onId?: number, // the entity id (for now support only entity with number as id)

	newTime?: string,
	startTime?: string,
	endTime?: string,

	ntd: boolean, // nothing done (when the job was already processed)

	todo?: any, // the ...Todo event (todo: check if we should type generic this one)
	done?: any, // the ...Done event (todo: check if we should type generic this one)
	progress?: { [name: string]: number }, // the step progress in (0 to 100) Names are snake format e.g., {framing_generate: 25, framing_upload: 12}

	err_code?: string, // only if state = failed
	err_msg?: string, // only if state = failed
}

//#endregion ---------- /Job ---------- 