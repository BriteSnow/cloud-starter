import { Bucket, getBucket } from 'cloud-bucket';
import redstream, { RedStream } from 'redstream';
import { CORE_STORE_BUCKET } from './conf';
import { getRedisClient } from './queue';


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
	const bucketStream = getBucketStream(bucket.name);

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
function getBucketStream(bucketName: string) {
	let bucketStream = bucketStreamByBucketName.get(bucketName);
	if (bucketStream == null) {
		const ioRedis = getRedisClient();
		bucketStream = redstream(ioRedis, bucketName + '_event');
		bucketStreamByBucketName.set(bucketName, bucketStream);
	}
	return bucketStream;
}
//#endregion ---------- /Bucket Streams ----------


