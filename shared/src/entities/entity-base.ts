const { freeze } = Object;

export const TIMESTAMPS_COLUMNS = freeze(['cid', 'ctime', 'mid', 'mtime']);

export interface Timestamped {
  cid: number,
  ctime: string, // iso (`YYYY-MM-DDTHH:mm:ss.sssZ`)
  mid: number,
  mtime: string, // iso (`YYYY-MM-DDTHH:mm:ss.sssZ`)
}

/**
 * Base interface for that have orgId
 */
export interface Orged {
  org: {
    id: number,
    name: string,
  }
}