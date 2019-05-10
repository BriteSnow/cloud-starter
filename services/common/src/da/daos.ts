import { OAuth } from 'shared/entities';
import { BaseDao } from './dao-base';
import { ProjectDao } from './dao-project';
import { UserDao } from './dao-user';


export const userDao = new UserDao();

export const projectDao = new ProjectDao();

export const oauthDao = new BaseDao<OAuth, number>('oauth', false);

/** Dao Registory per entity type name. 
 * Today used by the dse-generic.ts 
 * (if no generic DSE access should be given to an entity dao, do not add it to this list)
 */
export const daoByEntity: { [type: string]: BaseDao<any, any> } = {
	User: userDao,
	Project: projectDao
}

