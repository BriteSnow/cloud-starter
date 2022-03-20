import type { TimestampedRec } from './bases.js';

export const OrgTypeEnum = Object.freeze({
  personal: "personal",
  shared: "shared"
} as const);

export type OrgType = keyof typeof OrgTypeEnum;

/**
 * table name: 'org'
 */
export interface OrgRec extends TimestampedRec {
  id: number,
  uuid: string,

  type: OrgType,
  name: string,
}


