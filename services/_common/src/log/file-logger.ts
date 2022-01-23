import { LogWriter } from 'backlib';
import { glob, pathExists, saferRemove } from 'fs-aux';
import { appendFile, mkdir, rename } from 'fs/promises';
import * as Path from "path";
import { isString } from 'utils-min';


/** processing file, if return true, then file will be assumed to be full processed, and will be deleted */
export interface FileProcessorResult {
  retry: boolean;
}

export type FileProcessor = (file: string, retries?: number) => Promise<FileProcessorResult>;

/** Record serializer to string, which will be appended to the file. If null, record will be skipped */
export type RecordSerializer<R> = (rec: R) => string | null;

interface CustomFileWriterOptions<R> {
  /** name of the logWriter, will be used as prefix */
  name: string;
  /** Local directory in which the logs files will be saved */
  dir: string;
  /** maxCount of record before file is uploaded to destination */
  maxCount: number;
  /** max time (in seconds) before file is uploaded to destination (which ever comes first with maxCount) */
  maxTime: number;

  /** suffix to be added to the log file before the .ndjson */
  suffix?: string;

  /* Mehod to process the file (.e.g., upload to bucket, bigquery, ...) */
  fileProcessor?: FileProcessor;

  /* Optional recordSerializer to file. By default, JSON.serializer() (new line json) */
  recordSerializer?: RecordSerializer<R>;
}



export class CustomFileWriter<R> implements LogWriter<R> {

  readonly name: string;
  private dir: string;
  private maxCount: number;
  private maxTime: number;
  private suffix?: string;
  private fileProcessor?: FileProcessor;
  private recordSerializer: RecordSerializer<R>;

  private _init = false;
  private _rev = 0;
  private count = 0;
  private nextUpload: number | null = null; // null means nothing scheduled
  private lastUpload?: number;

  private file?: string;


  constructor(opts: CustomFileWriterOptions<R>) {
    this.name = opts.name;
    this.maxCount = opts.maxCount;
    this.maxTime = opts.maxTime;
    this.dir = opts.dir;
    this.suffix = opts.suffix;
    this.fileProcessor = opts.fileProcessor;
    this.recordSerializer = opts.recordSerializer ?? defaultSerializer;
  }

  private async init() {
    if (!this._init) {
      await mkdir(this.dir, { recursive: true });

      // delete the logs dir if exit
      const oldLogFiles = await glob(this.dir + `${this.name}*.log`);
      await saferRemove(oldLogFiles);
      console.log('Deleted old log files', oldLogFiles);

      this.rev();

      this._init = true;
    }

  }

  /** Update the revision file */
  private rev() {
    this.count = 0;
    this._rev = this._rev + 1;

    // filname format - e.g., web_log-2021-01-22-16-46-000-_suffix_.ndjson
    const name = this.name;
    const date = new Date().toISOString().replace(/[T:.]/g, "-").slice(0, -1);
    const suffix = (this.suffix != null) ? `-${this.suffix}` : '';
    const fileName = `${name}-${date}${suffix}.ndjson`;

    this.file = Path.join(this.dir, fileName)
  }


  /** IMPLEMENTATION of the FileWriter interface */
  async writeRec(rec: R) {

    if (!this._init) {
      await this.init();
    }

    // TODO: Need to move this outside of the generic log implementation (we do this because bigquery expect info to be string, since it can be dynamic)
    // NOTE: In fact, this whole file write and upload, should be part of a FileLogWriter, and we just treat it as above (perhaps in the BigQueryLogWriter extends FileLogWriter)
    const str = this.recordSerializer(rec);
    if (str != null) {
      const strWithNl = str + '\n'; // add the new line
      await appendFile(this.file!, strWithNl);
    }

    // add count
    this.count = this.count + 1;

    // if we are above the count, we upload
    if (this.count > this.maxCount) {
      console.log(`->> rev ${this.name} because count ${this.count} > maxCount ${this.maxCount}`);
      await this.endFile();
    }
    // if still below the count, but do not have this.nextUpload, schedule one
    else if (this.nextUpload === null) {
      const maxTimeMs = this.maxTime * 1000; // in ms

      const nextUpload = Date.now() + maxTimeMs;
      this.nextUpload = nextUpload;

      setTimeout(async () => {
        // perform only if this.nextUpload match the scheduled nextUpload (otherwise, was already processed and this schedule is outdated)
        if (this.nextUpload === nextUpload) {
          console.log(`->> rev ${this.name} because maxTimeMs ${maxTimeMs}`);
          await this.endFile();
        }
      }, maxTimeMs);
    }

  }

  private async endFile() {
    const file = this.file!;
    // we rev just before to make sure other logs will happen on new files
    this.rev();

    try {
      const exists = await pathExists(file);
      if (exists) {
        if (this.fileProcessor) {
          try {
            console.log(`->> endFile processing ${this.name} `);
            let procResult = await this.fileProcessor(file);
            if (procResult.retry == true) {
              if (procResult.retry === true) {
                // TODO: Add it to the this.retryList: RetryProcessingItem{retry: number, file: string}[]
                await saferRemove(file);
              }
            }
          } catch (ex: any) {
            console.log(`LOG PROCESSING ERROR - processing file '${file}' caused the following error: ${ex}`);
          }
        }
      } else {
        console.log(`LOG PROCESSING REMOVE ERROR - cannot be processed file '${file}' does not exists anymore`);
      }

    }
    // Note: note sure we need this global catch now. 
    catch (ex: any) {
      console.log(`LOG PROCESSING - logger.processLogFile - cannot upload to big query ${file}, ${ex.message}`);
      await rename(file, file + '.error');
    }

    this.count = 0;
    this.lastUpload = Date.now();
    this.nextUpload = null;
  }

}

/** default serializer */

function defaultSerializer<R>(rec: R): string {
  return isString(rec) ? rec : JSON.stringify(rec);
}
