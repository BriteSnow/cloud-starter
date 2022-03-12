import { ServiceLogRecord, WebLogRecord } from '#shared/log-types.js';
import { BaseLog, FileWriter, LogWriter, OnFileCompleted, RecordSerializer } from 'backlib';
import { execa } from 'execa';
import { pathExists } from 'fs-aux';
import { readFile } from 'fs/promises';
import { basename } from 'path';
import { stderr, stdout } from 'process';
import redstream, { objectDataParser, RedStream } from 'redstream';
import { wait } from 'utils-min';
import { KHOST, LOGS_STORE_BUCKET_NAME, LOGS_STORE_ROOT_DIR, LOG_DIR, LOG_MAX_COUNT, LOG_MAX_TIME, SERVICE_NAME, __version__ } from '../conf.js';
import { getRedisClient } from '../queue.js';
import { typify } from '../utils.js';

let _serviceLogStream: RedStream<ServiceLogRecord> | null = null;
let _webLogStream: RedStream<WebLogRecord> | null = null;

export class BaseAppLog<R> extends BaseLog<R> {

  constructor(logName: string, logStream: RedStream<R>, keys: readonly string[]) {

    const writers: LogWriter<R>[] = [];
    const baseName = logName;

    // - ADD REDIS WRITER
    writers.push({
      writeRec: async (rec: R) => {
        await logStream.xadd(rec);
      }
    });

    // -- ADD FILE WRITER - (with s3 uploader onFileCompleted)
    // e.g., web-server-web_log-2022-01-21-19-59-234-post_host_name.ndjson
    const fileNameProvider = (rev: number): string => {
      const prefix = `${SERVICE_NAME}-${logName}`;
      const date = new Date().toISOString().replace(/[T:.]/g, "-").slice(0, -1);
      const suffix = KHOST;
      const drop = __version__.toLocaleLowerCase();
      return `${prefix}-${date}-${suffix}-${drop}.csv`;
    };

    // file writer
    const fileWriter = new FileWriter<R>({
      maxCount: LOG_MAX_COUNT,
      maxTime: LOG_MAX_TIME,
      dir: `${LOG_DIR}/${baseName}`,
      fileNameProvider,
      fileHeaderProvider: () => { return keys.join(',') },
      recordSerializer: newRecordSerializer(keys),
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
      const content = await readFile(file, { encoding: 'utf-8' });
      // gzip the file
      await execa('gzip', [file], { stdout, stderr });

      // gzip will add the .gz extension and remove the previous file
      let gzFile = file + '.gz';
      let gzFileName = basename(gzFile);

      // build the S3 pass (using ss3)
      // extract the day yyyy-mm-dd-hh from the file name
      let s3Dst = `s3://${LOGS_STORE_BUCKET_NAME}/${LOGS_STORE_ROOT_DIR}/${SERVICE_NAME}/${logName}`;

      let timePartitions = '';
      const dayhourPartition = gzFileName.match(/20\d\d-\d\d-\d\d/)?.[0];
      if (dayhourPartition != null) {
        const yearPartition = dayhourPartition.slice(0, 4);
        const dayPartition = dayhourPartition.slice(0, 10);
        timePartitions = `${yearPartition}/raws/${dayPartition}`;
        // e.g., add /2022/raw/2022-01-21 (last number is the hours 24 format)
        s3Dst += `/${timePartitions}`;
      }
      s3Dst += `/${gzFileName}`;

      // Note - seems the await execa gzip does not year the file right away?
      if (!await pathExists(gzFile)) {
        await wait(2000);
      }

      if (!await pathExists(gzFile)) {
        console.log(`LOG UPLOAD ISSUE - file '${gzFile}' does not exist yet`);
        return;
      }

      // upload file with ss3 command line
      await wait(2000);
      console.log(`INFO - uploading log file to ${s3Dst}`);
      const out = await execa('which', ['ps']);
      await execa('ss3', ['cp', gzFile, s3Dst]);
      await wait(2000);
      // await saferRemove(gzFile);

      // TODO - Here could be a good time to upload other .gzip files (in case some where missed)

    } catch (ex: any) {
      console.log(`ERROR - appLogFileProcessor - could not process and upload log file\n\tfile: ${file}\n\tcause: ${ex}`);
    }

  }
}
// #endregion --- App On File Completed Handler

export function newRecordSerializer<R>(keys: readonly string[]): RecordSerializer<R> {
  return function csvSerializer(rec: any): string | null {
    let row: string[] = [];

    for (const key of keys) {
      const val = rec[key];
      if (val == null) {
        row.push('');
      } else if (typeof val == 'string') {
        // cheap way to replace the double quote for output simplicity
        // All strings will be double quoted in the csv
        const valStr = val.replaceAll('"', "'");
        row.push(`"${valStr}"`)
      } else {
        row.push(`${val}`);
      }
    }

    return row.join(",");
  }
}




// #region    --- Log Redis
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
// #endregion --- Log Redis