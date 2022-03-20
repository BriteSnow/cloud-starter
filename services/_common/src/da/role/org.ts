const { freeze } = Object;

export const orgRoleEnum = freeze({
  // full priviledge on the org
  org_r_owner: 'org_r_owner',
  // full priviledge except delete and rename
  org_r_admin: 'org_r_admin',

  org_r_editor: 'org_r_editor',
  org_r_viewer: 'org_r_viewer',
  org_r_member: 'org_r_member',
} as const);


export type OrgRole = keyof typeof orgRoleEnum;


export const orgAccessEnum = freeze({
  a_web_login: 'a_web_login',

} as const);

export type OrgAccess = keyof typeof orgAccessEnum;