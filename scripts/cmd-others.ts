import * as child_process from 'child_process';
import { router } from 'cmdrouter';
import execa from 'execa';
import * as fs from 'fs-extra-plus';
import { spawn } from 'p-spawn';
import * as Path from 'path';
import { prompt } from './utils';

const SERVICES_DIR = './services/';

router({ pupdate, dclean, runTest }).route();

async function pupdate() {
	const dirPath = (dirName: string) => Path.join(SERVICES_DIR, dirName + '/');

	const list = await fs.readdir(SERVICES_DIR);
	const dirNamesToUpdate: string[] = [];

	for (const dirName of list) {
		const dir = dirPath(dirName);

		if (await fs.pathExists(Path.join(dir, 'package.json'))) {
			try {
				console.log(`-- npm outdated for ${dir}`)
				const proc = execa('npm', ['outdated'], { cwd: dir, buffer: true, reject: false });
				const { stdout: stdoutStream } = proc;
				stdoutStream?.pipe(process.stdout);
				const { stdout } = await proc;
				if (stdout.includes('Wanted')) {
					dirNamesToUpdate.push(dirName);
				}
				console.log();
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