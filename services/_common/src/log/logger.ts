
import { ServiceLogRecord, SERVICE_LOG_RECORD_KEYS, WebLogRecord, WEB_LOG_RECORD_KEYS } from '#shared/log-types.js';
import { KHOST } from '../conf.js';
import { nowTimestamp } from '../utils.js';
import { BaseAppLog, getServiceLogStream, getWebLogStream } from './log-utils.js';

// #region    --- Public Log Functions
//// `service_log` and `web_log` are the only public functions for app code to log log-records. 
export async function service_log(rec: Omit<ServiceLogRecord, 'timestamp' | 'khost'>) {
	const timestamp = nowTimestamp();
	const khost = KHOST;
	return _serviceLog.log({ ...rec, ...{ timestamp, khost } });
}

export async function web_log(rec: Omit<WebLogRecord, 'timestamp' | 'khost'>) {
	const timestamp = nowTimestamp();
	const khost = KHOST;

	// Avoid logging any local network pings (noisy and low value for now). They are generate when in cloud cluster. s
	const ip = rec.ip?.trim() ?? ''; // to be safe
	if (ip.startsWith('::ffff:10.') || ip.startsWith('10.')) {
		return;
	} else {
		return _webLog.log({ ...rec, ...{ timestamp, khost } });
	}
}
// #endregion --- Public Log Functions


// #region    --- Log Classes
class WebLog extends BaseAppLog<WebLogRecord>{
	constructor() {
		const logStream = getWebLogStream();
		super("web_log", logStream, WEB_LOG_RECORD_KEYS);
	}
}

class ServiceLog extends BaseAppLog<ServiceLogRecord>{
	constructor() {
		const logStream = getServiceLogStream();
		super("service_log", logStream, SERVICE_LOG_RECORD_KEYS);
	}
}

// Note: the logger objects are designd to be used as singletons (like daos)
//       however they are not exported, as the callers should call the public log functions
//       `service_log` and `web_log`
const _serviceLog = new ServiceLog(); // must be after ServiceLog definition
const _webLog = new WebLog(); // must be after ServiceLog definition
// #endregion --- /Log Classes


