// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/shared/src/entities-base.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

export interface QueryOptions<E> {
	matching?: Partial<E>;
	ids?: number[];
	orderBy?: string;
	limit?: number;
}

export interface StampedEntity {
	cid?: number,
	ctime?: string,
	mid?: number,
	mtime?: string
}

export interface OAuth extends StampedEntity {
	id: number;
	userId: number;
	oauth_token: string;
	oauth_id?: string;
	oauth_username?: string;
	oauth_name?: string;
	oauth_picture?: string;
}
