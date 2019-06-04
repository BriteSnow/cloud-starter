import { getKnex } from './da/db';

// IMPORTANT: Do not change this appVersion value manually, change it in the package.json and do a "npm run version"
const staticConfigurations: any = {
	appVersion: "DROP-001-SNAPSHOT"
}


// Type was can be typed by config name (if not, the getConfig return type will be any, thanks to the conditional typing below)
interface Configs {
	github: { client_id: string, client_secret: string };
	db: { database: string, user: string, password: string, host: string };
	bigquery: { client_email: string, project_id: string, private_key: string };
	google_oauth: { client_id: string, client_secret: string, redirect_url: string }
}

/**
 * Return a configuration from a configuration name. Those configuration could be static, comes from redis, or from DB (and cached).
 * 
 */
// NOTE: Conditional typing is only use as declaration, implementation signature should be conditional less (see:  https://stackoverflow.com/a/52144866/686724)
export async function getConfig<T extends keyof Configs | string>(name: T): Promise<T extends keyof Configs ? Configs[T] : any>;
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

