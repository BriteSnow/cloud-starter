import { Orged, Timestamped } from './entity-base';

/**
 * Project entity model when read from the DAO
 * table name: 'project'
 */
export interface Project extends Timestamped, Orged {
  /**
   * @access some stuff
   * @minimum 123
   */
  id: number,
  uuid: string,

  name: string,

  desc?: string,
}

export interface ProjectForCreate {
  name: string,
  desc?: string,
}

/**
 * For rpc/dao update. (id will be passed as a parent parameters)
 */
export interface ProjectForPatch {
  name?: string,
  desc?: string,
}