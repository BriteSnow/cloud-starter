import { Orged, Timestamped } from './entity-base';

/**
 * Ticket entity model when read from the DAO
 * table name: 'ticket'
 */
export interface Ticket extends Timestamped, Orged {
  id: number,
  uuid: string,

  title: string,

  desc?: string,
}

export interface TicketForCreate {
  title: string,
  projectId: string,
  desc?: string,
}

/**
 * For rpc/dao update. (id will be passed as a parent parameters)
 */
export interface TicketForPatch {
  title?: string,
  desc?: string,
}