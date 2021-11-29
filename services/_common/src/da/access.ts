// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { GlobalAccess, isAccess, isWksAccess, WksAccess } from '#shared/access-types.js';
import { newLeafTracer } from 'backlib';
import { isFunction } from 'util';
import { asNum } from 'utils-min';
import { assertUserContext, getSysContext, UserContext } from '../user-context.js';

const leafTracer = newLeafTracer();


/////////////////////
// Access module providing the @AccessRequires decorator access
////


//#region    ---------- Access Types ---------- 
interface IDao {
	get(utx: UserContext, id: number): Promise<Object>;
	table: string;
}


// The union of all Role or Privilege
type EntityMatchAccess =
	'@id' | // match utx.userId with second arg (number value or .id)
	'@cid' | // match utx.userId with second arg (number value or .cid)
	'@userId';  // match utx.userId with second arg (number value or .userId)

export type Access = GlobalAccess | WksAccess | EntityMatchAccess;


class AccessFail extends Error { }

class AccessDecoratorError extends Error {
	constructor(msg: string) {
		super(`ACCESS WRONG @AccessRequires - ${msg}`);
	}
}

//#endregion ---------- /Access Types ---------- 

/**
 * AccessRequires will pass if one of the Access name match the user privilege/role  match the Access name with the Utx of the call (Utx must be first arg of the decorated function)
 * 
 * There are 4 types of Access name. They all match to the corresponding domaing 
 *  - `#admin` this match if the user is an 'admin' at the 
 *  - `@id | @cid | ...` are the utx.userId with second arg number or data.id, data.cid, ... secpmd argument property match
 *  - `pp_...` are the wks privilege name
 *  - `wr_...` are the wks role names
 * 
 * Note: In this application, Role are scoped by wks (can be scoped on different object or root depending of the app need)
 */

//#region    ---------- Decorator ---------- 
export function AccessRequires(...accessList: Access[]) {

	return function (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {

		const method = descriptor.value!;

		const fn = async function accessRequiresWrapper(this: any) {
			const sysCtx = await getSysContext();
			const isLeafMethod = leafTracer.trace(this.constructor, target.constructor, propertyKey);

			// we perform the access control only for the top most class for this methods
			if (isLeafMethod) {
				const methodRef = `${this.constructor.name}.${method.name}`;

				//// check UTX
				const utx = arguments[0];
				try {
					assertUserContext(utx);
				} catch (ex) {
					throw new AccessDecoratorError(`First argument of ${this.constructor.name}.${method.name} must be a "UserContext" and not a ${utx.constructor.name}`);
				}

				//// Check base class (right now DAO only)
				// Note 1: At this point, we support AccessRequires only on Dao, we can broaden the support later (if needed)
				//         This assumption allows get entity for property check when second arg is number (entityId)
				//         This could be widen later with a EntityGetter{ getEntity(utx, id)} type of interface
				// Note 2: Does not instanceof BaseDao as this create a cyclic dependencies with the annotation
				const self = this as any;
				if (!(self.constructor.name.endsWith('Dao') && self.table != null && isFunction(self.get))) {
					throw new AccessDecoratorError(`at this point @AccessRequires only support dao methods. ${methodRef} is not of BaseDao`);
				}
				const dao = self as IDao;

				//// Get user info
				const userId = utx.userId;

				let pass = false;

				//// Get entity info (id or data from second parameter)
				// get the second argument (entity entityId if number, or a props)
				const entityId = asNum(arguments[1]);
				const data = (entityId == null) ? arguments[1] : null;

				//// If user.type = 'sys' accept
				if (utx.hasAccess('#sys')) {
					pass = true;
				}


				//// Check AccessList if needed
				if (!pass) {
					// if needed entity record for the entityId (loaded only if needed)
					let entity: any;

					for (const access of accessList) {

						//// USERID MATCH - if we have access with @propEname, meaning matching utx.userId with entity propName property value
						if (access.startsWith('@')) {
							const propName = access.substring(1); // propName to be 

							// If we have entity id, we fetch and check
							if (entityId != null) {
								entity = entity ?? await dao.get(sysCtx, entityId);
								const val = entity[propName];
								if (userId === val) {
									pass = true;
									break;
								}
							}
							// if we have a data object, check if property match
							else if (data != null) {
								const val = data[propName];
								if (val == null) {
									throw new AccessDecoratorError(`${this.constructor.name}.${method.name} - AccessRequires ${access} must be on a method with a entityId arg2 or a arg2 with a .${propName}.`);
								}
								if (userId === val) {
									pass = true;
									break;
								}
							} else {
								throw new AccessDecoratorError(`${this.constructor.name}.${method.name} - AccessRequires ${access} must be on a method with the entityId or Data as second params.`);
							}
						}

						//// GLOBAL ACCESS check
						else if (isAccess(access)) {
							if (utx.hasAccess(access)) {
								pass = true;
								break;
							}
						}

						//// WKS PRIVILEGE
						else if (isWksAccess(access)) {
							// First, try to get the wksId from utx or parameters if wks table
							const wksId = utx.wksId ?? ((dao.table === 'wks') ? entityId : undefined);
							// if not, data might be queryOptions, and might have a .access
							const queryAccess = data?.access;

							// if we have a query access, check if valid
							if (queryAccess && !isWksAccess(queryAccess)) {
								throw new AccessDecoratorError(`queryOptions.access ${queryAccess} is not a valid wks access.`);
							}

							// if we do ot have wksId in context/params or queryAccess, then, no enough information to validate access
							if (wksId == null && !queryAccess) {
								throw new AccessDecoratorError(`access ${access} on ${methodRef} requires a 'utx.wksId' or wksId second arg or queryOptions.access, but find none.`);
							}

							// first, if wksId context, check access
							if (wksId != null && await utx.hasWksAccess(wksId, access)) {
								pass = true;
								break;
							}
							// if in the queryOptions.access, then, check mach
							else if (queryAccess === access) {
								pass = true;
								break;
							}
						}
					} // for (const access of accessList)
				}

				// if did nto pass, then, throw exception
				if (!pass) {
					throw new AccessFail(`User ${userId} does not have the necessary access for "${methodRef}" ${(entityId != null) ? `[${entityId}]` : ''} , access: [${accessList.join(',')}]`);
				}
			} // if (isLeaf)

			return method.apply(this, arguments);
		}

		// simplify debugging
		Object.defineProperty(fn, "name", { value: `${method.name}_accessWrapper` });

		descriptor.value = fn;
	}

}
//#endregion ---------- /Decorator ----------