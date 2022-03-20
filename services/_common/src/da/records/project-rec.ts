import type { TimestampedRec } from './bases.js';
import { OrgedRec } from './bases.js';

/**
 * table name: 'project'
 * @jc_test super cool
 * @access all stuff
 */
export interface ProjectRec extends TimestampedRec, OrgedRec {
  id: number,
  uuid: string,

  name: string,

  desc?: string,
}

