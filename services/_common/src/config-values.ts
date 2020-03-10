/** 
 * Static config values based on environement. 
 * - Re-exported from config.ts
 * - Allows to safely access those value in a synchronous manner in application code
 * - For more complex value, use the config `getConfig` method (which also return those property/values)
 **/

export const __version__ = "DROP-002-SNAPSHOT";
export const HTTPS_MODE = (process.env.https_mode === 'true') ? true : false;
export const PWD_SCHEME_01_SALT = process.env.pwd_scheme_01_salt;
export const PWD_SCHEME_02_SALT = process.env.pwd_scheme_02_salt;
export const WEB_TOKEN_SALT = PWD_SCHEME_02_SALT;
export const WEB_TOKEN_DURATION = 3600; // in sec (this could come from a env/config)

