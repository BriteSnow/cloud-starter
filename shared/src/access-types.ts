const { freeze, entries } = Object; // for readibility


//#region    ---------- App Access ---------- 
const GLOBAL_ACCESSES = freeze([
	'#sys', // this is a special access only for getSysContext
	'#user', // any logged request (api or user) get the special #user access
	'a_ui', // ui web interface access (web login). Can be negated in user.accesses modifiers
	'a_api', // for API access. Can bee added in user.accesses modifiers
	'a_admin', // all basic admin tasks
	'a_admin_edit_user' // ability to reset user information
] as const);

export type GlobalAccess = typeof GLOBAL_ACCESSES[number];

export type GlobalAccesses = { [key in GlobalAccess]?: true };

// Note: Widen type to string to allow caller to call .has(name:string) 
const GLOBAL_ACCESSES_SET = freeze(new Set(GLOBAL_ACCESSES as readonly string[]));

export function isAccess(name: string): name is GlobalAccess {
	return GLOBAL_ACCESSES_SET.has(name);
}

// By default r_user have the web ui access.
// Also all users have the special '#user' access (any user)
const r_user: Readonly<GlobalAccess[]> = freeze(['#user', 'a_ui']);
const r_admin: Readonly<GlobalAccess[]> = freeze([...r_user, 'a_admin', 'a_admin_edit_user']);

const _GLOBAL_ROLES = freeze({
	r_user,
	r_admin
} as const);


export type GlobalRoleName = keyof typeof _GLOBAL_ROLES;


// Note: widen tyime to allow .get(string)
export const GLOBAL_ROLES = freeze(new Map(entries(_GLOBAL_ROLES)));

//#endregion ---------- /App Access ---------- 

//#region    ---------- Project Access ---------- 
// `pa_` prefix for Project Privilege
// The list of all project privilege Should be 
const PROJECT_ACCESSES = freeze([
	'pa_delete',
	'pa_user_assign_admin', // add user admin (only owner)
	'pa_edit', // edit the project name, description, 
	'pa_user_add', // add user
	'pa_user_remove',
	'pa_ticket_create',
	'pa_label_assign',
	'pa_view' // view info and tickets from a projects
] as const);

// ProjectPrivilege type "pp_user_add_admin" | "pp_edit" | ....
export type ProjectAccess = typeof PROJECT_ACCESSES[number];

export type ProjectAccesses = { [key in ProjectAccess]?: true };

// Note: Widen type to string to allow caller to call .has(name:string) 
const PROJECT_ACCESSES_SET = freeze(new Set(PROJECT_ACCESSES as readonly string[]));

export function isProjectAccess(name: any): name is ProjectAccess {
	return PROJECT_ACCESSES_SET.has(name);
}
export function assertProjectAccess(name: any): asserts name is ProjectAccess {
	if (!isProjectAccess(name)) {
		throw new Error(`Access ${name} is not a valid project access. Must be one of ${PROJECT_ACCESSES}`);
	}
}


// `pr_` prefix for Project Role
const pr_viewer: Readonly<ProjectAccess[]> = freeze(['pa_view']);
const pr_member: Readonly<ProjectAccess[]> = freeze([...pr_viewer, 'pa_label_assign', 'pa_ticket_create']);
const pr_admin: Readonly<ProjectAccess[]> = freeze([...pr_member, 'pa_user_remove', 'pa_user_add', 'pa_edit']);
const pr_owner: Readonly<ProjectAccess[]> = PROJECT_ACCESSES;


// Project Roles to be export with the correct typing (this will post mistak above)
const _PROJECT_ROLES = freeze({
	pr_owner,
	pr_admin,
	pr_member,
	pr_viewer
} as const);

export type ProjectRoleName = keyof typeof _PROJECT_ROLES;


// Note: Readonly Map<string, ProjectPrivilegeName> Wider map (Map<string, readonly ProjectPivilegeName[]>) allowing caller to call .has(name:string)
export const PROJECT_ROLES = freeze(new Map(entries(_PROJECT_ROLES)));

// Note: To help ProjectRolesName entry key typing (otherwise string)
const projectRolesEntries = entries(_PROJECT_ROLES) as [ProjectRoleName, Readonly<ProjectAccess[]>][];

export const PROJECT_ROLES_BY_ACCESS = freeze(projectRolesEntries
	.reduce((acc, [role, accesses]) => {
		for (const access of accesses) {
			const roles = acc.get(access)?.concat(role) ?? [role];
			acc.set(access, freeze(roles));
		}
		return acc;
	}, new Map<ProjectAccess, Readonly<ProjectRoleName[]>>()));
//#endregion ---------- /Project Access ----------



