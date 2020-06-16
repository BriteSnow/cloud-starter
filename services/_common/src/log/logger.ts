
import redstream, { RedStream } from 'redstream';
import { objectDataParser } from 'redstream/dist/utils';
import { ServiceLogRecord, WebLogRecord } from 'shared/log-types';
import { KHOST, LOG, LOG_DIR } from '../conf';
import { getRedisClient } from '../queue';
import { nowTimestamp, typify } from '../utils';
import { BaseLog, LogWriter } from './log-lib';

const BASE_LOG_WRITER_OPTIONS = { ...LOG, dir: LOG_DIR };

let _serviceLogStream: RedStream<ServiceLogRecord> | null = null;
let _webLogStream: RedStream<WebLogRecord> | null = null;


//#region    ---------- Log Classes ---------- 
class WebLog extends BaseLog<WebLogRecord>{
	constructor() {
		const writers: LogWriter<WebLogRecord>[] = [];
		const baseName = 'web_log';


		// redis stream writer
		const logStream = getWebLogStream();
		writers.push({
			name: baseName + '_stream',
			writeRec: async (rec: WebLogRecord) => {
				await logStream.xadd(rec);
			}
		});

		super({ writers });
	}
}

class ServiceLog extends BaseLog<ServiceLogRecord>{
	constructor() {

		const writers: LogWriter<ServiceLogRecord>[] = [];
		const baseName = 'service_log';

		// redis stream writer
		const logStream = getServiceLogStream();
		writers.push({
			name: baseName + '_stream',
			writeRec: async (rec: ServiceLogRecord) => {
				await logStream.xadd(rec);
			}
		});

		super({ writers });
	}
}

// Note: the logger objects are designd to be used as singletons (like daos)
//       however they are not exproted, as the callers should call the public log functions
//       `service_log` and `web_log`
const _serviceLog = new ServiceLog(); // must be after ServiceLog definition
const _webLog = new WebLog(); // must be after ServiceLog definition
//#endregion ---------- /Log Classes ---------- 


//#region    ---------- Public Log Functions ---------- 
//// `service_log` and `web_log` are the public method call for service callers to log a record. 
//// Note: In service log, the timestamp are set at log time (not start of the job / request)

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
//#endregion ---------- /Public Log Functions ----------


//#region    ---------- Log Streams ---------- 

/**
 * Returns the WebLog RedStream. 
 * Must be used to write or read from the stream.
 * HOWEVER, Must not be used to read BLOCK from the stream (which should not be needed for logs)
 */
export function getWebLogStream(): RedStream<WebLogRecord> {
	if (_webLogStream === null) {
		const ioRedis = getRedisClient(); // use the common redis cient, for non blocking blocking

		_webLogStream = redstream(ioRedis, {
			key: 'web_log',
			dataParser: (arr: string[], id) => {
				const strObj = objectDataParser(arr, id);
				const record = typify(strObj, { nums: ['userId', 'orgId', 'status', 'duration'], bools: ['success'] }) as WebLogRecord;
				return record;
			}
		});
	}
	return _webLogStream;
}


/**
 * Returns the ServiceLog RedStream.
 * Must be used to write or read from the stream.
 * HOWEVER, Must not be used to read BLOCK from the stream (which should not be needed for logs)
 */
export function getServiceLogStream(): RedStream<ServiceLogRecord> {
	if (_serviceLogStream === null) {
		const ioRedis = getRedisClient(); // use the common redis cient, for non blocking use

		_serviceLogStream = redstream(ioRedis, {
			key: 'service_log',
			dataParser: (arr: string[]) => {
				const strObj = objectDataParser(arr);
				const record = typify(strObj, { nums: ['userId', 'orgId', 'duration'], bools: ['success'] }) as ServiceLogRecord;
				return record;
			}
		});
	}
	return _serviceLogStream;
}
//#endregion ---------- /Log Streams ----------

