import { BaseDao } from './dao-base';
import { MediaDao } from './dao-media';
import { OAuthDao } from './dao-oauth';
import { PrlinkDao } from './dao-prlink';
import { UserDao } from './dao-user';
import { WksDao } from './dao-wks';

export const userDao = new UserDao();

export const wksDao = new WksDao();

export const mediaDao = new MediaDao();

export const oauthDao = new OAuthDao();

export const rplinkDao = new PrlinkDao();

/** Dao Registory per entity type name. 
 * Today used by the dse-generic.ts 
 * (if no generic DSE access should be given to an entity dao, do not add it to this list)
 */
export const daoByEntity: { [type: string]: BaseDao<any, any> } = {
	User: userDao,
	Wks: wksDao,
	Media: mediaDao
}



