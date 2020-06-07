
import { getKnexClient } from './da/db';


const viewer = ['project-read', 'ticket-read'];
const member = [...viewer, 'ticket-write', 'label-assign']; // all viewer privileges, plus ticket writer and label creator
const manager = [...member, 'project-write', 'label-create'];
const owner = [...manager, 'project-write', 'project-remove'];

const privilegesByProjectRoles: { [role: string]: string[] } = {
	viewer,
	member,
	manager,
	owner
};

type Prole = 'viewer' | 'member' | 'manager' | 'owner';


export async function saveProle(userId: number, projectId: number, name: Prole) {
	const k = await getKnexClient();
	// insert into user_prole ("userId", "projectId", name) values (1, 1032, 'owner') on conflict on CONSTRAINT user_prole_pkey do update set name = 'owner'
	const sql = `insert into user_prole ("userId", "projectId", name) values (?, ?, ?) 
	on conflict on CONSTRAINT user_prole_pkey do update set name = ?`;
	const values = [userId, projectId, name, name];
	const r = await k.raw(sql, values);
	return r; // TODO: could return 'updated' or 'inserted' if needed / possible.
}


// NOTE: here we do not use the daos scheme to get the role as it will add cyclic issues and it is not needed. 
export async function getProjectPrivileges(userId: number, projectId: number) {
	const k = await getKnexClient();
	let query = k('user_prole');

	query.where({ userId, projectId });

	// TODO: probably should have only one role per user (need user_prole constraint)

	// do the query (need cast here)
	const records = await query.then() as any[];

	const roles = records.map(r => r.name);

	const privileges = [];
	for (const role of roles) {
		const privs = privilegesByProjectRoles[role];
		privileges.push(...privs);
	}

	return privileges;

}