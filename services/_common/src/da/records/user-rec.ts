import type { GlobalRole } from '../role/global.js';
import type { TimestampedRec } from './bases.js';

/**
 * table name: 'user'
 */
export interface UserRec extends TimestampedRec {
  id: number,
  uuid: string,

  username: string,
  fullName?: string,

  role: GlobalRole,

  pwd: string | null,
  psalt: string,
  pwdHistory: string[] | null,

  tsalt: string,
}

export interface UserForCreate extends Partial<Omit<UserRec, "id" | "cid" | "ctime" | "mid" | "mtime">> { };

export interface UserForPatch extends Partial<Omit<UserRec, "id" | "cid" | "ctime" | "mid" | "mtime">> { };