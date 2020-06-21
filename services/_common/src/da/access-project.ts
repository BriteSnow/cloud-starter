
import { ProjectRoleName, PROJECT_ROLES } from 'shared/access-types';
import { getKnexClient } from './db';



export async function saveProjectRole(userId: number, projectId: number, role: ProjectRoleName) {
	const k = await getKnexClient();
	// insert into user_prole ("userId", "projectId", role) values (1, 1032, 'owner') on conflict on CONSTRAINT user_prole_pkey do update set name = 'owner'
	const sql = `insert into user_prole ("userId", "projectId", role) values (?, ?, ?) 
	on conflict on CONSTRAINT user_prole_pkey do update set role = ?`;
	const values = [userId, projectId, role, role];
	const r = await k.raw(sql, values);
	return r; // TODO: could return 'updated' or 'inserted' if needed / possible.
}


// NOTE: here we do not use the daos scheme to get the role as it will add cyclic issues and it is not needed. 
export async function getProjectAccesses(userId: number, projectId: number) {
	const k = await getKnexClient();
	let query = k('user_prole');

	query.where({ userId, projectId });

	// do the query (need cast here)
	const records = await query.then() as any[];

	const roles = records.map(r => r.role as string);

	const accessList = [];
	for (const role of roles) {
		const privs = PROJECT_ROLES.get(role);
		if (privs) {
			accessList.push(...privs);
		} else {
			// TODO: log CODE_ERROR
		}
	}

	return accessList;

}