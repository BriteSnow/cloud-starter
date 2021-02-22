const { freeze, entries } = Object; // for readibility


//#region    ---------- App Access ---------- 
const GLOBAL_ACCESSES = freeze([
	'#sys', // this is a special access only for getSysContext
	'#user', // any logged request (api or user) get the special #user access
	'a_ui', // ui web interface access (web login). Can be negated in user.accesses modifiers
	'a_api', // for API access. Can bee added in user.accesses modifiers
	'a_admin', // all basic admin tasks
	'a_pwd_reset', // password reset
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
const r_admin: Readonly<GlobalAccess[]> = freeze([...r_user, 'a_admin', 'a_admin_edit_user', 'a_pwd_reset']);

const _GLOBAL_ROLES = freeze({
	r_user,
	r_admin
} as const);


export type GlobalRoleName = keyof typeof _GLOBAL_ROLES;


// Note: widen tyime to allow .get(string)
export const GLOBAL_ROLES = freeze(new Map(entries(_GLOBAL_ROLES)));

//#endregion ---------- /App Access ---------- 

//#region    ---------- Wks Access ---------- 
// `wa_` prefix for Wks Privilege
// The list of all Wks privilege Should be 
const WKS_ACCESSES = freeze([
	'wa_delete',
	'wa_user_assign_admin', // add user admin (only owner)
	'wa_content_create', // Create new content for this wks
	'wa_content_edit', // 
	'wa_content_view', // view info and tickets from a Wkss
	'wa_user_add', // add user
	'wa_user_remove'
] as const);

// WksPrivilege type "pp_user_add_admin" | "pp_edit" | ....
export type WksAccess = typeof WKS_ACCESSES[number];

export type WksAccesses = { [key in WksAccess]?: true };

// Note: Widen type to string to allow caller to call .has(name:string) 
const WKS_ACCESSES_SET = freeze(new Set(WKS_ACCESSES as readonly string[]));

export function isWksAccess(name: any): name is WksAccess {
	return WKS_ACCESSES_SET.has(name);
}
export function assertWksAccess(name: any): asserts name is WksAccess {
	if (!isWksAccess(name)) {
		throw new Error(`Access ${name} is not a valid workspace access. Must be one of ${WKS_ACCESSES}`);
	}
}


// `wr_` prefix for Wks Role
const wr_viewer: Readonly<WksAccess[]> = freeze(['wa_content_view']);
const wr_editor: Readonly<WksAccess[]> = freeze([...wr_viewer, 'wa_content_create', 'wa_content_edit']);
const wr_admin: Readonly<WksAccess[]> = freeze([...wr_editor, 'wa_user_remove', 'wa_user_add']);
const wr_owner: Readonly<WksAccess[]> = WKS_ACCESSES;


// Wks Roles to be export with the correct typing (this will post mistak above)
const _WKS_ROLES = freeze({
	wr_owner: wr_owner,
	wr_admin: wr_admin,
	wr_editor: wr_editor,
	wr_viewer: wr_viewer
} as const);

export type WksRoleName = keyof typeof _WKS_ROLES;


// Note: Readonly Map<string, WksPrivilegeName> Wider map (Map<string, readonly WksPivilegeName[]>) allowing caller to call .has(name:string)
export const WKS_ROLES = freeze(new Map(entries(_WKS_ROLES)));

// Note: To help WksRolesName entry key typing (otherwise string)
const wksRolesEntries = entries(_WKS_ROLES) as [WksRoleName, Readonly<WksAccess[]>][];

export const WKS_ROLES_BY_ACCESS = freeze(wksRolesEntries
	.reduce((acc, [role, accesses]) => {
		for (const access of accesses) {
			const roles = acc.get(access)?.concat(role) ?? [role];
			acc.set(access, freeze(roles));
		}
		return acc;
	}, new Map<WksAccess, Readonly<WksRoleName[]>>()));
//#endregion ---------- /Wks Access ----------



