import * as chokidar from 'chokidar';
import { router } from 'cmdrouter';
import { execa } from 'execa';
import debounce from 'lodash.debounce';
import { getPodName } from './utils.js';

const { stdout, stderr } = process;
const execaOpts = Object.freeze({ stdout, stderr });
const servicesDir = 'services';

const debugPortByServiceName: any = {
	'web-server': '9228',
	'gh-syncer': '9230',
}

router({ test, testw, testd }).route();

async function test(serviceName: string, testGrep: string) {
	if (!serviceName) {
		console.log("ERROR - test needs to have a service name. Try 'npm run test web-server'");
		return;
	}
	const podName = await getPodName(serviceName);

	await run(false, serviceName, testGrep, podName);
}

/** run a 'npm run dtest [-g ...]` on a service, which will start a debug session (default host/port) */
async function testd(serviceName: string, testGrep: string) {
	if (!serviceName) {
		console.log("ERROR - dtest needs to have a service name. Try 'npm run dtest web-server'");
		return;
	}

	// kubectl port-forward $(kubectl get pods -l run=bb-web-server --no-headers=true -o custom-columns=:metadata.name) 9229
	const podName = await getPodName(serviceName);
	const port = debugPortByServiceName[serviceName];
	execa('kubectl', ['port-forward', podName, `${port}:9229`], execaOpts); // debug port on the pod is still default 9229

	return watchAndRun(true, serviceName, testGrep);
}

/** run 'npm run test [-g ...]` on a service image when dist/*.js file changes */
async function testw(serviceName: string, testGrep: string) {
	if (!serviceName) {
		console.log("ERROR - twatch needs to have a service name. Try 'npm run twatch web-server'");
		return;
	}

	return watchAndRun(false, serviceName, testGrep);
}

// NOTE - Unfortunately we cannot use the "mocha -w" for watch as it seems to have issue with type: module / esm loader
async function watchAndRun(debug: boolean, serviceName: string, testGrep: string) {
	const podName = await getPodName(serviceName);

	const serviceDir = `${servicesDir}/${serviceName}`;
	const serviceDistDir = `${serviceDir}/dist`;

	// start the building
	execa('tsc', ['-w'], { ...execaOpts, cwd: serviceDir }); // this will create a new restart

	// --------- service test watch and run --------- //
	console.log('watch ' + `${serviceDistDir}/**/*.js`);
	const watcher = chokidar.watch(`${serviceDistDir}/**/*.js`, { depth: 99, ignoreInitial: true, persistent: true });

	const debounced_run = debounce(() => {
		return run(debug, serviceName, testGrep, podName);
	}, 500);

	watcher.on('change', async function (filePath: string) {
		debounced_run();
	});

	watcher.on('add', async function (filePath: string) {
		debounced_run();
	});
	// --------- /service test watch and run --------- //

	// initial call
	// cr.map();

}

// TODO: need to remove the podName, we probably can call the kexec serviceName -- pkill ...
async function run(debug = false, serviceName: string, testGrep: string, podName: string) {

	// if debug, we make sure we kill any node process with inspect (to make sure the port is not used)
	if (debug) {
		const args = ['exec', podName];
		args.push('--', 'pkill', '-f', 'inspec'); // somehow, if we pass "'inpsec'" it fails (ok, because single word)
		await execa('kubectl', args, execaOpts); // TODO - might ignore fail. 
	}

	const args = ['kexec', serviceName];
	args.push('--', 'npm', 'run');

	if (debug) {
		args.push('dtest');
	} else {
		args.push('test');
	}

	if (testGrep) {
		args.push('--', '-g', testGrep);
	}
	console.log('->> run ->>> npm', args.join(" "));
	execa('kdd', args, execaOpts);
}
