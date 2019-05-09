import { router } from 'cmdrouter';
import { spawn } from 'p-spawn';
var child_process = require('child_process');

router({ dclean, runTest }).route();

// run these two commands
// docker rmi -f $(docker images -f 'reference=localhost:5000/*' -q)
// docker rmi -f $(docker images -f 'reference=britesnow/*' -q)

async function dclean() {
	// need run twice for these two commands
	const cmds = ['localhost:5000/*', "britesnow/*", 'localhost:5000/*', "britesnow/*"];
	for (let cmdVal of cmds) {

		let argsList = ['images', '-f', `reference=${cmdVal}`, '-q'];

		let spawnObj = await child_process.spawn('docker', argsList);

		spawnObj.stdout.on('data', async function (chunk: any) {
			let imagesIdsStr = chunk.toString();
			let imageIds = imagesIdsStr.split(/\s+/);

			imageIds.forEach(async (imageId: any) => {
				if (imageId) {
					let args = ['rmi', '-f', imageId];
					await spawn('docker', args);
				}
			});
		});

		spawnObj.stderr.on('data', (data: any) => {
			console.log('on error : ' + data);
		});
		spawnObj.on('close', function (code: any) {
			console.log('close code : ' + code);
		});
		spawnObj.on('exit', (code: any) => {
			console.log('exit code :' + code);
		});

		// let args = ['rmi', '-f', "$(docker images -f 'reference=localhost:5000/*' -q)"];
		// if (cmdVal === "britesnow/*") {
		// 	args = ['rmi', '-f', "$(docker images -f 'reference=britesnow/*' -q)"];
		// }
		// try {
		// 	await spawn('docker', args);
		// } catch (ex) {
		// 	console.log(`Can't clean reference=${cmdVal}, skipping`);
		// }
		console.log();
	}
}


async function runTest() {
	const result = await spawn("sh", ['services/test-web/run-test.sh'], {
		capture: "stdout"
	});
	console.log(result.toString());
}