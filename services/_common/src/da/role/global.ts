const { freeze } = Object;

export const globalRoleEnum = freeze({
  r_sys: 'r_sys',
  r_user: 'r_user'
} as const);

export type GlobalRole = keyof typeof globalRoleEnum;

export const globalAccessEnum = freeze({
  a_web_login: 'a_web_login',
  a_api: 'a_api',
  a_orgs_list: 'a_orgs_list',
  a_orgs_create: 'a_orgs_create',
  a_orgs_update: 'a_orgs_update',
  a_orgs_delete: 'a_orgs_delete',
  a_users_list: 'a_users_list',
  a_users_create: 'a_users_create',
  a_users_update: 'a_users_update',
  a_users_delete: 'a_users_delete',
} as const);

export type GlobalAccess = keyof typeof globalAccessEnum;

// Note: We use array to {[key]: true} object so that it can be frozen (Set cannot be be frozen without wrapper)

const R_USER_ACCESSES: GlobalAccess[] = ['a_web_login', 'a_orgs_create'];
export const globalAccessesForRoleUser = freeze(R_USER_ACCESSES.reduce((obj, v) => (obj[v] = true, obj), {} as any));

const R_SYS_ACCESSES: GlobalAccess[] = [...R_USER_ACCESSES, 'a_orgs_list', 'a_orgs_update', 'a_users_list', 'a_users_create', 'a_users_update', 'a_users_delete'];
export const globalAccessesForRoleSys = freeze(R_SYS_ACCESSES.reduce((obj, v) => (obj[v] = true, obj), {} as any));

type AccessesByRole = { [key in GlobalRole]: { [key in GlobalAccess]: true } };
export const accessesByRole: AccessesByRole = freeze({
  'r_sys': globalAccessesForRoleSys,
  'r_user': globalAccessesForRoleUser
});

