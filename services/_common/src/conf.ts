/** 
 * Static config values based on environement. 
 * - Re-exported from config.ts
 * - Allows to safely access those value in a synchronous manner in application code
 * - For more complex value, use the config `getConfig` method (which also return those property/values)
 **/

const { freeze } = Object;
const { env } = process;

export const __version__ = "DROP-002-SNAPSHOT";

// should HOST environment should be set by kuberenetes.
export const KHOST = env.HOSTNAME ?? 'no-host';

export const SERVICE_NAME = env.service_name ?? 'no-service';

//// HTTP
export const HTTPS_MODE = (env.https_mode === 'true') ? true : false;
export const PWD_SCHEME_01_SALT = env.pwd_scheme_01_salt;
export const PWD_SCHEME_02_SALT = env.pwd_scheme_02_salt;
export const PWD_PRLINK_SALT = env.pwd_prlink_salt;
export const WEB_TOKEN_SALT = PWD_SCHEME_02_SALT;
export const WEB_TOKEN_DURATION = 3600; // in sec (this could come from a env/config)

export const CORE_STORE_BUCKET = freeze({
	bucketName: env.core_store_bucket_name!,
	access_key_id: env.core_store_access_key_id!,
	access_key_secret: env.core_store_access_key_secret!,
	minio_endpoint: env.core_store_minio_endpoint, // if undefined then, S3
});


export const CORE_STORE_ROOT_DIR = env.core_store_root_dir!;

// Note: For dev, we assume localhost:9000/_bucket_name_/. For prod, it will be the cdn base url to the core store bucket backend.
export const CORE_STORE_CDN_BASE_URL = env.core_store_cdn_base_url!;

//// Services ssl 
export const SERVICE_SSL_KEY = env.service_ssl_key!;
export const SERVICE_SSL_CERT = env.service_ssl_cert!;

//// Database
export const DB_PASSWORD = env.db_password!;
export const DB_HOST = env.db_host!;
export const DB_DATABASE = env.db_database!;
export const DB_USER = env.db_user!;
export const DB = freeze({ host: DB_HOST, database: DB_DATABASE, user: DB_USER, password: DB_PASSWORD });

//// GOOGLE OAUTH
export const GOOGLE_OAUTH_REDIRECT_URL = env.google_oauth_redirect_url!;
export const GOOGLE_OAUTH_CLIENT_ID = env.google_oauth_client_id!;
export const GOOGLE_OAUTH_CLIENT_SECRET = env.google_oauth_client_secret!;
export const GOOGLE_OAUTH = GOOGLE_OAUTH_CLIENT_ID ? freeze({ client_id: GOOGLE_OAUTH_CLIENT_ID, redirect_url: GOOGLE_OAUTH_REDIRECT_URL, client_secret: GOOGLE_OAUTH_CLIENT_SECRET }) : null;

//// LOG
export const LOG_DIR = './logs/';
export const LOG_MAX_COUNT = Number(env.log_max_count!);
export const LOG_MAX_TIME = Number(env.log_max_time!);
export const LOG = freeze({ maxCount: LOG_MAX_COUNT, maxTime: LOG_MAX_TIME });

//// OTHERS
export const PERF_LOG_THRESHOLD_WEB = 1000; // in ms. Threshold when utx.perfContext.items should be logged

export const CDN_BASE_URL = 'http://localhost:9000/';

