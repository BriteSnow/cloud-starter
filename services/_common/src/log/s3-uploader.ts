import { execa } from 'execa';
import { basename } from 'path';
import { LOGS_STORE_BUCKET_NAME, LOGS_STORE_ROOT_DIR } from '../conf.js';
import { FileProcessor, FileProcessorResult } from './file-logger.js';

export function newAppLogFileProcessor(name: string): FileProcessor {

  return async function appLogFileProcessor(file: string, retries?: number): Promise<FileProcessorResult> {

    try {
      // gzip the file
      await execa('gzip', [file]);

      // gzip will add the .gz extension and remove the previous file
      let gzFile = file + '.gz';
      let gzFileName = basename(gzFile);

      // build the S3 pass (using ss3)
      // extract the day yyyy-mm-dd from the file name
      let dayPartition = gzFileName.match(/20\d\d-\d\d-\d\d/)?.[0];
      let s3Dst = `s3://${LOGS_STORE_BUCKET_NAME}/${LOGS_STORE_ROOT_DIR}/${name}`;
      if (dayPartition != null) {
        s3Dst += `/${dayPartition}`;
      }
      s3Dst += `/${gzFileName}`;

      // upload file with ss3 command line
      console.log(`INFO - uploading log file to ${s3Dst}`);
      await execa('ss3', ['cp', gzFile, s3Dst]);

    } catch (ex: any) {
      console.log(`ERROR - appLogFileProcessor - could not process and upload log file\n\tfile: ${file}\n\tcause: ${ex}`);
    }


    return { retry: false };
  }
}

