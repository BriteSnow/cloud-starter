import * as bcrypt from 'bcrypt';
import * as child_process from 'child_process';
import { router } from 'cmdrouter';
import * as fs from 'fs-extra-plus';
import { spawn } from 'p-spawn';
import * as Path from 'path';
import { performance } from 'perf_hooks';
import { prompt } from './utils';

const SERVICES_DIR = './services/';

router({ crypt, pupdate, dclean, runTest }).route();

// run these two commands
// docker rmi -f $(docker images -f 'reference=localhost:5000/*' -q)
// docker rmi -f $(docker images -f 'reference=britesnow/*' -q)

async function crypt() {
	const clear = 'Some Clear Text';
	let start = performance.now();
	const salt1 = await bcrypt.genSalt(10);
	const hash1 = await bcrypt.hash(clear, salt1);
	const timeHash = performance.now() - start;

	start = performance.now();
	const comp1 = await bcrypt.compare(clear, hash1);
	const timeCompare = performance.now() - start;


	const salt2 = salt1 + 'AAAAAAAAAA';
	const hash2 = await bcrypt.hash(clear, salt2);
	const comp2 = await bcrypt.compare(clear, hash2);
	console.log(`SALT1: ${salt1}\nhash1: ${hash1}  - ${comp1} - ${timeHash} - ${timeCompare}`);
	console.log(`SALT2: ${salt2}\nhash1: ${hash1}  - ${comp2}`);

}


async function pupdate() {
	const dirPath = (dirName: string) => Path.join(SERVICES_DIR, dirName + '/');

	const list = await fs.readdir(SERVICES_DIR);
	const dirNamesToUpdate: string[] = [];

	for (const dirName of list) {
		const dir = dirPath(dirName);

		if (await fs.pathExists(Path.join(dir, 'package.json'))) {
			try {
				const result = await spawn('npm', ['outdated'], { cwd: dir, ignoreFail: true });
				const code = result.code;
				if (code !== 0) { // npm outated exist with 1 if some dependencies need update
					dirNamesToUpdate.push(dirName);
				}
			} catch (ex) {
				console.log('ERROR', ex)
			}
		}

	}

	if (dirNamesToUpdate.length === 0) {
		console.log('All up to date, nothing to update!');
		return;
	}

	const response = await prompt(`\nDo you want to update ${dirNamesToUpdate.join(', ')} ? Y / N: `);

	if (response === 'Y') {
		for (const dirName of dirNamesToUpdate) {
			const dir = dirPath(dirName);
			await spawn('npm', ['update'], { cwd: dir });
		}
	} else {
		console.log(`Cancelling update (your answered ${response})`, response);
	}

}


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