import type { TimestampedRec } from './bases.js';
import { OrgedRec } from './bases.js';

/**
 * table name: 'project'
 */
export interface TicketRec extends TimestampedRec, OrgedRec {
  id: number,

  uuid: string,

  title: string,

  desc?: string
}

