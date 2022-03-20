import { Timestamped } from '../../../../../shared/src/entities/entity-base';

const { freeze } = Object;

export const TIMESTAMPS_COLUMNS = freeze(['cid', 'ctime', 'mid', 'mtime']);

export interface TimestampedRec extends Timestamped { }

/**
 * Base interface for Record that have orgId
 */
export interface OrgedRec {
  orgId: number
}