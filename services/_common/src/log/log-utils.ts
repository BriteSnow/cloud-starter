import { ServiceLogRecord, WebLogRecord } from '#shared/log-types.js';
import { BaseLog, FileWriter, LogWriter, OnFileCompleted } from 'backlib';
import { execa } from 'execa';
import { basename } from 'path';
import redstream, { objectDataParser, RedStream } from 'redstream';
import { KHOST, LOGS_STORE_BUCKET_NAME, LOGS_STORE_ROOT_DIR, LOG_DIR, LOG_MAX_COUNT, LOG_MAX_TIME, SERVICE_NAME } from '../conf.js';
import { getRedisClient } from '../queue.js';
import { typify } from '../utils.js';

let _serviceLogStream: RedStream<ServiceLogRecord> | null = null;
let _webLogStream: RedStream<WebLogRecord> | null = null;

export class BaseAppLog<R> extends BaseLog<R> {
  constructor(logName: string, logStream: RedStream<R>) {

    const writers: LogWriter<R>[] = [];
    const baseName = logName;

    // ADD WRITER - Redis
    writers.push({
      writeRec: async (rec: R) => {
        await logStream.xadd(rec);
      }
    });

    // ADD WRITER - File (with s3 uploader onFileCompleted)
    // e.g., web-server-web_log-2022-01-21-19-59-234-post_host_name.ndjson
    const fileNameProvider = (rev: number): string => {
      const prefix = `${SERVICE_NAME}-${logName}`;
      const date = new Date().toISOString().replace(/[T:.]/g, "-").slice(0, -1);
      const suffix = KHOST;
      return `${prefix}-${date}-${suffix}.ndjson`;
    };
    // file writer
    const fileWriter = new FileWriter<R>({
      maxCount: LOG_MAX_COUNT,
      maxTime: LOG_MAX_TIME,
      dir: `${LOG_DIR}/${baseName}`,
      fileNameProvider,
      onFileCompleted: newOnFileCompleted(baseName),
    });
    writers.push(fileWriter);

    // Call super with list of writers
    super({ writers });
  }
}

// #region    --- App On File Completed Handler
export function newOnFileCompleted(logName: string): OnFileCompleted {

  return async function appOnFileCompletedHandler(file: string): Promise<void> {

    try {
      // gzip the file
      await execa('gzip', [file]);

      // gzip will add the .gz extension and remove the previous file
      let gzFile = file + '.gz';
      let gzFileName = basename(gzFile);

      // build the S3 pass (using ss3)
      // extract the day yyyy-mm-dd-hh from the file name
      let s3Dst = `s3://${LOGS_STORE_BUCKET_NAME}/${LOGS_STORE_ROOT_DIR}/${SERVICE_NAME}/${logName}`;

      let timePartitions = '';
      const dayhourPartition = gzFileName.match(/20\d\d-\d\d-\d\d-\d\d/)?.[0];
      if (dayhourPartition != null) {
        const yearPartition = dayhourPartition.slice(0, 4);
        const dayPartition = dayhourPartition.slice(0, 10);
        const hourPartition = dayhourPartition.slice(11, 13);
        timePartitions = `${yearPartition}/parts/${dayPartition}/${hourPartition}`;
        // e.g., add /2022/parts/2022-01-21/01 (last number is the hours 24 format)
        s3Dst += `/${timePartitions}`;
      }
      s3Dst += `/${gzFileName}`;

      // upload file with ss3 command line
      console.log(`INFO - uploading log file to ${s3Dst}`);
      await execa('ss3', ['cp', gzFile, s3Dst]);

    } catch (ex: any) {
      console.log(`ERROR - appLogFileProcessor - could not process and upload log file\n\tfile: ${file}\n\tcause: ${ex}`);
    }

  }
}

// #endregion --- App On File Completed Handler

//#region    ---------- Log Redis Streams ---------- 

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
//#endregion ---------- /Log Redis Streams ----------