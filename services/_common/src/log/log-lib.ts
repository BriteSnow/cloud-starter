import * as fs from 'fs-extra-plus';
import * as Path from 'path';
import { isString } from 'utils-min';


//#region    ---------- BaseLog ---------- 
interface LogOptions<R> {
	writers: LogWriter<R>[]
}

/**
 * Base Log class that handle the base log management logic. 
 */
export class BaseLog<R> {
	private logWriters: LogWriter<R>[] = [];

	constructor(opts: LogOptions<R>) {
		this.logWriters = [...opts.writers];
	}

	async log(rec: R) {

		// 
		for (const writer of this.logWriters) {
			if (writer.writeRec) {
				try {
					await writer.writeRec(rec);
				} catch (ex) {
					// here log console.log, no choise
					console.log(`LOG ERROR - Log exception when writeRec on logWriter ${writer.name}. ${ex}`);
				}
			}
		}

	}

}
//#endregion ---------- /BaseLog ---------- 

export interface LogWriter<R> {
	readonly name: string;
	writeRec?(rec: R): Promise<void>
}


//#region    ---------- FileLogWriter ---------- 
/** processing file, if return true, then file will be assumed to be full processed, and will be deleted */
export type FileProcessor = (file: string) => Promise<boolean>;

/** Record serializer to string, which will be appended to the file. If null, record will be skipped */
export type RecordSerializer<R> = (rec: R) => string | null;

interface FileLogWriterOptions<R> {
	/** name of the logWriter, will be used as prefix */
	name: string;
	/** Local directory in which the logs files will be saved */
	dir: string;
	/** maxCount of record before file is uploaded to destination */
	maxCount: number;
	/** max time (in ms) before file is uploaded to destination (which ever comes first with maxCount) */
	maxTime: number;

	/* Mehod to process the file (.e.g., upload to bucket, bigquery, ...) */
	fileProcessor?: FileProcessor;

	/* Optional recordSerializer to file. By default, JSON.serializer() (new line json) */
	recordSerializer?: RecordSerializer<R>;
}



export class FileLogWriter<R> implements LogWriter<R> {

	readonly name: string;
	private dir: string;
	private maxCount: number;
	private maxTime: number;
	private fileProcessor?: FileProcessor;
	private recordSerializer: RecordSerializer<R>;

	private _init = false;
	private _rev = 0;
	private count = 0;
	private nextUpload: number | null = null; // null means nothing scheduled
	private lastUpload?: number;

	private file?: string;


	constructor(opts: FileLogWriterOptions<R>) {
		this.name = opts.name;
		this.maxCount = opts.maxCount;
		this.maxTime = opts.maxTime;
		this.dir = opts.dir;
		this.fileProcessor = opts.fileProcessor;
		this.recordSerializer = opts.recordSerializer ?? defaultSerializer;
	}

	private async init() {
		if (!this._init) {
			await fs.mkdirs(this.dir);

			// delete the logs dir if exit
			const oldLogFiles = await fs.glob(this.dir + `${this.name}*.log`);
			await fs.saferRemove(oldLogFiles);
			console.log('Deleted old log files', oldLogFiles);

			this.rev();

			this._init = true;
		}

	}

	/** Update the revision file */
	private rev() {
		this.count = 0;
		this._rev = this._rev + 1;
		const suffix = `${this._rev}`.padStart(5, '0');
		this.file = Path.join(this.dir, `${this.name}-${suffix}.log`)
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
			await fs.appendFile(this.file!, str);
		}

		// add count
		this.count = this.count + 1;

		// if we are above the count, we upload
		if (this.count > this.maxCount) {
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
			const exists = fs.pathExists(file);
			if (exists) {
				if (this.fileProcessor) {
					await this.fileProcessor(file);
				}
				await fs.saferRemove(file);
			} else {
				console.log(`CODE ERROR - can't upload to big query ${file} does not exists`);
			}

		} catch (ex) {
			console.log(`ERROR - logger.processLogFile - cannot upload to big query ${file}, ${ex.message}`);
			await fs.rename(file, file + '.error');
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

//#endregion ---------- /FileLogWriter ---------- 


