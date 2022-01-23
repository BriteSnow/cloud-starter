/** 
 * Static config values based on environement. 
 * - Re-exported from config.ts
 * - Allows to safely access those value in a synchronous manner in application code
 * - For more complex value, use the config `getConfig` method (which also return those property/values)
 **/

const { freeze } = Object;
const { env } = process;

export const __version__ = "DROP-004";

// should HOST environment should be set by kuberenetes.
export const KHOST = envAsStrOr('HOSTNAME', 'no-host-env');

export const SERVICE_NAME = envAsStr('service_name');

//// HTTP
export const HTTPS_MODE = (env.https_mode === 'true') ? true : false;
export const PWD_SCHEME_01_SALT = envAsStr('pwd_scheme_01_salt');
export const PWD_SCHEME_02_SALT = envAsStr('pwd_scheme_02_salt');
export const PWD_PRLINK_SALT = envAsStr('pwd_prlink_salt');
export const WEB_TOKEN_SALT = PWD_SCHEME_02_SALT;
export const WEB_TOKEN_DURATION = 3600; // in sec (this could come from a env/config)

export const CORE_STORE_BUCKET = freeze({
	bucketName: envAsStr('core_store_bucket_name'),
	access_key_id: envAsStr('core_store_access_key_id'),
	access_key_secret: envAsStr('core_store_access_key_secret'),
	minio_endpoint: envAsStrOr('core_store_minio_endpoint', undefined), // if undefined then, S3
});


export const CORE_STORE_ROOT_DIR = envAsStr('core_store_root_dir');

// Note: For dev, we assume localhost:9000/_bucket_name_/. For prod, it will be the cdn base url to the core store bucket backend.
export const CORE_STORE_CDN_BASE_URL = envAsStr('core_store_cdn_base_url');

//// Database
export const DB_PASSWORD = envAsStr('db_password');
export const DB_HOST = envAsStr('db_host');
export const DB_DATABASE = envAsStr('db_database');
export const DB_USER = envAsStr('db_user');
export const DB = freeze({ host: DB_HOST, database: DB_DATABASE, user: DB_USER, password: DB_PASSWORD });

//// GOOGLE OAUTH
export const GOOGLE_OAUTH_REDIRECT_URL = envAsStrOr('google_oauth_redirect_url', undefined);
export const GOOGLE_OAUTH_CLIENT_ID = envAsStrOr('google_oauth_client_id', undefined);
export const GOOGLE_OAUTH_CLIENT_SECRET = envAsStrOr('google_oauth_client_secret', undefined);
export const GOOGLE_OAUTH = (GOOGLE_OAUTH_CLIENT_ID && GOOGLE_OAUTH_REDIRECT_URL && GOOGLE_OAUTH_CLIENT_SECRET) ? freeze({ client_id: GOOGLE_OAUTH_CLIENT_ID, redirect_url: GOOGLE_OAUTH_REDIRECT_URL, client_secret: GOOGLE_OAUTH_CLIENT_SECRET }) : null;

//// LOG
export const LOG_DIR = '/service/logs';
export const LOG_MAX_COUNT = envAsNumOr('log_max_count', 5000);
// max_count in seconds 
export const LOG_MAX_TIME = envAsNumOr('log_max_time', 60 * 6); // every 6 minutes

//// LOG bucket
export const LOGS_STORE_BUCKET_NAME = envAsStr('logs_store_bucket_name');
export const LOGS_STORE_ROOT_DIR = envAsStr('logs_store_root_dir');

//// OTHERS
export const PERF_LOG_THRESHOLD_WEB = 1000; // in ms. Threshold when utx.perfContext.items should be logged

export const CDN_BASE_URL = envAsStr('core_store_cdn_base_url');


// #region    --- Env Getter Functions
function envAsStrOr<D>(name: string, defaul: D): string | D {
	const val = env[name];
	if (val == null) {
		return defaul;
	} else {
		return val;
	}
}

function envAsNumOr<D>(name: string, defaul: D): number | D {
	const val = env[name];
	if (val == null) return defaul;

	const num = Number(val);
	if (num == Number.NaN) {
		console.log(`WARNING - ENV - Environment variable '${name}' was not a number, but was provided fallback default, so can continue.`);
		return defaul;
	} else {
		return num;
	}
}

/**
 * Get and return the environment variable value as string, and log and throw error if not present.
 * 
 * @param envName 
 * @returns 
 */
function envAsStr(name: string): string {
	const val = env[name];
	if (val == null) {
		const message = `ERROR - ENV - Missing required environment variable '${name}'`;
		console.log(message);
		throw new Error(message);
	} else {
		return val;
	}
}

function envAsNum(name: string): number {
	const val = envAsStr(name);
	const num = Number(val);
	if (num === Number.NaN) {
		const message = `ERROR - ENV - Environement variable '${name}' is not a number but must be.`;
		console.log(message);
		throw new Error(message);
	} else {
		return num;
	}
}

// #endregion --- Env Getter Functions


