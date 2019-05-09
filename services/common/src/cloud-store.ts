
import { getConf } from './conf';
import Storage = require('@google-cloud/storage');



//#region    ---------- Public APIs ---------- 

export async function storeUpload(file: string, storePath: string) {
	const bucket = await storeBucket();
	return bucket.upload(file, { destination: storePath });
}


//#endregion ---------- /Public APIs ---------- 


// This is private at this point, we should not need it, the public APIs should be added. 
// HOWEVER, if the public API becomes to specific, then, perhaps we expose this one. 
async function storeBucket() {
	// get the google bucket info
	const name = await getConf("storeBucketName");
	const projectId = await getConf("storeProjectId");
	const clientEmail = await getConf("storeClientEmail");
	const privateKey = await getConf("storePrivateKey");

	if (!name || !privateKey) {
		throw "BUCKET_CREDETIALS_NOT_FOUND";
	}

	const gBucketInfo = {
		name: name,
		conf: {
			projectId: projectId,
			credentials: {
				private_key: privateKey,
				client_email: clientEmail
			}
		}
	};

	// get the google storage object.
	const storage = new Storage(gBucketInfo.conf);
	// get the bucket name
	const bucket = await storage.bucket(gBucketInfo.name);
	return bucket;
}
