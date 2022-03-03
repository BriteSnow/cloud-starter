

/** 
 * - if `includes..._timestamps: true`
 */
export interface Timestamped {
  cid: number;
  ctime: string; // ISO 8601 - YYYY-MM-DDTHH:mm:ss.sssZ
  mid: number;
  mtime: string; // ISO 8601 - YYYY-MM-DDTHH:mm:ss.sssZ
}