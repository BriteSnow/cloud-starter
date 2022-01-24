
export type LogLevel = 'info' | 'warn' | 'error';

export const COMMON_LOG_RECORD_KEYS = Object.freeze(['timestamp', 'khost', 'service', 'success', 'duration', 'userId', 'orgId', 'err_code', 'err_msg'] as const);
export interface CommonLogRecord {
	// utxId: string, // TODO: needs to defined utxId, so that we can track multiple web to service log correlation

	// required
	timestamp: string,
	khost: string,
	service: string,
	success: boolean, // true by default, MUST be false if err_code, err_msg

	duration?: number; // optional by default

	// common optional
	userId?: number,
	orgId?: number,

	// error
	err_code?: string,
	err_msg?: string
}

export const SERVICE_LOG_RECORD_KEYS = Object.freeze([...COMMON_LOG_RECORD_KEYS, 'level', 'jobName', 'jobOn', 'step'] as const);
export interface ServiceLogRecord extends CommonLogRecord {
	level: LogLevel,

	jobName?: string, // (e.g., 'sync') The main job name (next level down the service)
	jobOn?: string, // (e.g., 'repo:123') A serialized identifier of a resource being worked on

	// Note: If step, MUST have same jobName, jobOn that other step for the same job. 
	//       Duration will be the duration step
	//       If not step, then, means it is the duration for the whole job. 
	step?: string, // (e.g., 'sync-labels') A sub part of a job 
}

// NOTE: for now, WebLogRecord is a different workflow, and do not get use with context.log
export const WEB_LOG_RECORD_KEYS = Object.freeze([...COMMON_LOG_RECORD_KEYS, 'http_status', 'http_method', 'path', 'ip', 'ips', 'device', 'br_name', 'br_version', 'os_name', 'os_version'] as const);
export interface WebLogRecord extends CommonLogRecord {

	http_status: number, // http status
	http_method: string; // http method

	path: string,
	duration: number, // for web log ,this is required

	ip: string, // first ip address (sometime has multiple, ips has them all)
	ips: string, // all ips address
	device?: string,
	br_name?: string,
	br_version?: string,
	os_name?: string,
	os_version?: string,
}

