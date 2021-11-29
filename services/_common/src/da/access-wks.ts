
import { WksRoleName, WKS_ROLES } from 'shared/access-types.js';
import { getKnexClient } from './db.js';



export async function saveWksRole(userId: number, wksId: number, role: WksRoleName) {
	const k = await getKnexClient();
	// insert into user_wks ("userId", "wksId", role) values (1, 1032, 'owner') on conflict on CONSTRAINT user_wks_pkey do update set name = 'owner'
	const sql = `insert into user_wks ("userId", "wksId", role) values (?, ?, ?) 
	on conflict on CONSTRAINT user_wks_pkey do update set role = ?`;
	const values = [userId, wksId, role, role];
	const r = await k.raw(sql, values);
	return r; // TODO: could return 'updated' or 'inserted' if needed / possible.
}


// NOTE: here we do not use the daos scheme to get the role as it will add cyclic issues and it is not needed. 
export async function getWksAccesses(userId: number, wksId: number) {
	const k = await getKnexClient();
	let query = k('user_wks');

	query.where({ userId, wksId });

	// do the query (need cast here)
	const records = await query.then() as any[];

	const roles = records.map(r => r.role as string);

	const accessList = [];
	for (const role of roles) {
		const privs = WKS_ROLES.get(role);
		if (privs) {
			accessList.push(...privs);
		} else {
			// TODO: log CODE_ERROR
		}
	}

	return accessList;

}