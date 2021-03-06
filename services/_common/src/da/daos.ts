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



