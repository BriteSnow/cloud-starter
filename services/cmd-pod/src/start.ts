/////////////////////
// The agent service is primarely designed to run administative task, and therefore does not do anything 
// in the start process. However, as some point, it could listen to redis stream and/or pub/sub to do some
// administrative task ask well. 
////


//main();

async function main() {

}


async function listenViaBlocking(client: any) {
	let videoId: number | null = null;
	for (; true;) { // eslint-disable-line (we use for rather than while to be able to use "continue")
		try {
			// get the next item from the queue list
			const result = await client.brpop('cmd-pod.todo', 0);
			const str = result[1];
			if (str) {

			}
		} catch (ex) {
		}
	}
}

