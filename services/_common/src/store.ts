import { Bucket, getBucket } from 'cloud-bucket';
import redstream, { RedStream } from 'redstream';
import { CORE_STORE_BUCKET } from './conf.js';
import { getRedisClient } from './queue.js';


const bucketStreamByBucketName: Map<string, RedStream> = new Map();

//#region    ---------- Store Bucket Getter ---------- 
let _coreBucket: Bucket | undefined;

export async function getCoreBucket() {
	if (!_coreBucket) {
		const coreBucketOrig = await getBucket(CORE_STORE_BUCKET);
		// _coreBucket = proxyBucket(coreBucketOrig);
		_coreBucket = wrapBucket(coreBucketOrig);
	}
	return _coreBucket!;
}


function wrapBucket(bucket: Bucket) {
	const bucketStream = getBucketEventStream(bucket.name);

	// wrap the upload
	const fnUpload = bucket.upload;
	Object.defineProperties(bucket, {
		upload: {
			value: async function (this: Bucket, ...args: [string, string]) {
				const result = fnUpload.apply(this, args);

				const [localPath, destPath] = args;
				const msg = { localPath, destPath };
				await bucketStream.xadd(msg);

				return result;
			}
		}
	});
	return bucket;

}
//#endregion ---------- /Store Bucket Getter ---------- 


//#region    ---------- Bucket Streams ---------- 
/**
 * If dedicatedClient, then, returns a new redstream with a new redis client (non cached)
 * If dedicatedClient = false, then, returns
 * @param bucketName Return a bucket stream 
 * @param dedicatedClient 
 */
export function getBucketEventStream(bucketName: string, dedicatedClient = false) {
	const streamKey = bucketName + '_event';
	if (dedicatedClient) {
		return redstream(getRedisClient(true), streamKey);
	} else {
		let bucketStream = bucketStreamByBucketName.get(bucketName);
		if (bucketStream == null) {
			const ioRedis = getRedisClient();
			bucketStream = redstream(ioRedis, streamKey);
			bucketStreamByBucketName.set(bucketName, bucketStream);
		}
		return bucketStream;
	}

}
//#endregion ---------- /Bucket Streams ----------

