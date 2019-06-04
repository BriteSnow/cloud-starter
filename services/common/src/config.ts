// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/services/common/src/queue.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { getKnex } from './da/db';
import { ConfigType } from 'config-type';

// IMPORTANT: Do not change this appVersion value manually, change it in the package.json and do a "npm run version"
const staticConfigurations: any = {
	appVersion: "DROP-001-SNAPSHOT"
}

/**
 * Return a configuration from a configuration name. Those configuration could be static, comes from redis, or from DB (and cached).
 * 
 */
// NOTE: Conditional typing is only use as declaration, implementation signature should be conditional less (see:  https://stackoverflow.com/a/52144866/686724)
export async function getConfig<T extends keyof ConfigType | string>(name: T): Promise<T extends keyof ConfigType ? ConfigType[T] : any>;
export async function getConfig(name: string): Promise<any> {
	let data: any | undefined;
	// first, try to get it from the environment
	data = getEnv(name);

	// if not found, try the static value
	if (data == null) {
		data = staticConfigurations[name];
	}

	if (data == null) {
		const k = await getKnex();
		const r = await k('config').where({ name });
		if (r && r.length === 1) {
			data = r[0].data; // data is the jsonb
		}
	}

	if (!data) {
		throw new Error(`Code error - getConf for name '${name}' not found.`);
	}

	return data;
}



function getEnv(name: string): string | object | undefined {
	const env = process.env;
	// first try to get the value from the name
	let val = env[name];

	// if found, we return the value
	if (val) {
		return val;
	}

	// if not found, we try to see if it is prefix with the '-' pattern
	const obj: any = {};
	let has = false;
	const prefix = name + '-';
	for (const envName of Object.keys(env)) {
		if (envName.startsWith(prefix)) {
			has = true;
			const propName = envName.substring(prefix.length);
			obj[propName] = env[envName];
		}
	}
	return (has) ? obj : undefined;
}

