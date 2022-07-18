import chokidar from 'chokidar';
import { router } from 'cmdrouter';
import { execa } from 'execa';
import debounce from 'lodash.debounce';
import * as Path from 'path';
import { wait } from 'utils-min';
import { getPodName } from './utils.js';

const NOT_RESTART_IF_PATH_HAS = '/test/';

const { stdout, stderr } = process;
const execaOpts = Object.freeze({ stdout, stderr });

// Note - For now duplication of the kdd.yaml system property
const SYSTEM = 'cstar';
const DEPLOYMENT_PREFIX = `${SYSTEM}-`;
const DEPLOYMENT_SUFFIX = `-dep`;

const WATCH_RUN_MODE = 'DEBUG_DEMON';
// use DEBUG_DEMON_INSPECT if needs node --inpect
// const WATCH_RUN_MODE = 'DEBUG_DEMON_INSPECT';

router({ watch }).route();



async function watch() {

	//#region    ---------- Frontend watch ---------- 
	// watch the watch for frontends/web
	execa('kdd', ['watch', 'web'], execaOpts);
	// execa('kdd', ['watch', 'admin'], execaOpts);
	//#endregion ---------- /Frontend watch ---------- 

	//#region    ---------- services watch ---------- 
	// NOTE: the number is the debug port, and we avoid the standard 9229 as chrome tend to automatically ping it which create console noise
	// watch services (configure in .vscode/launch.json for debug)
	watchService('web-server', '9230');
	// watchService('admin-server', '9231');

	watchService('vid-init', '9240');
	watchService('vid-scaler', '9241');
	// //#endregion ---------- /services watch ---------- 


	// //#region    ---------- cmd-pod sql watch ---------- 
	// const createDbDebounced = debounce(() => {
	// 	execa('kdd', ['kexec', 'cmd-pod', 'npm', 'run', 'recreateDb']);
	// }, 500)

	// const sqlWatcher = chokidar.watch('services/cmd-pod/sql', { depth: 99, ignoreInitial: true, persistent: true });

	// sqlWatcher.on('change', async function (filePath: string) {
	// 	console.log(`services/cmd-pod/sql change: ${filePath}`);
	// 	createDbDebounced();
	// });

	// sqlWatcher.on('add', async function (filePath: string) {
	// 	console.log(`services/cmd-pod/sql add: ${filePath}`);
	// 	createDbDebounced();
	// });
	// //#endregion ---------- /cmd-pod sql watch ---------- 

	// //#region    ---------- ico watch ---------- 
	// execa('npm', ['run', 'sketchdev', '--', '-w'], execaOpts);
	// //#endregion ---------- /ico watch ---------- 
}


async function watchService(serviceName: string, debugPort: string) {
	const serviceDir = `services/${serviceName}`;

	// kubectl port-forward $(kubectl get pods -l run=cstar-web-server --no-headers=true -o custom-columns=:metadata.name) 9229

	const podName = await getPodName(serviceName);

	// spawn('kubectl', ['port-forward', podName, `${debugPort}:9229`]);
	execa('kubectl', ['port-forward', podName, `${debugPort}:9229`]);

	// make sure it listen to port
	await wait(2000);

	execa('tsc', ['-w'], { cwd: serviceDir });

	// console.log('waiting for tsc -w');
	await wait(3000);

	// For now build the deployment name manually from convention
	// NOTE: kdd will add a "kdd ksetenv servicename environment variable"
	const dep = `${DEPLOYMENT_PREFIX}${serviceName}${DEPLOYMENT_SUFFIX}`;

	// set the deployment watch run mod
	console.log(`kubectl set deployment/${dep} to RUN_MODE=${WATCH_RUN_MODE}`)
	const args = ['set', 'env', `deployment/${dep}`, `RUN_MODE=${WATCH_RUN_MODE}`];
	await execa('kubectl', args, execaOpts);

	const distDir = Path.join(serviceDir, '/dist/');
	const watcher = chokidar.watch(distDir, { depth: 99, ignoreInitial: true, persistent: true });


	const cr = debounce(async () => {
		// If we have one of the DEBUG_DEMON modes, then, just touch a json file to trigger nodemon to restart
		if (WATCH_RUN_MODE.startsWith("DEBUG_DEMON")) {
			// kdd kexec web-server touch /service/nodemon-do-restart.json
			await execa('kdd', ['kexec', serviceName, 'touch', '/service/nodemon-do-restart.json'], execaOpts)
		}
		// Else, for NORMAL and DEBUG_INSPECT we trigger a deployment redepploy by changing a env variable to a unique value
		else {
			// kubectl set env deployment/cstar-web-server-dep KCTL_SET_ENV_TS=1657995576759
			await execa('', ['set', 'env', `deployment/${dep}`, 'RUN_MODE=DEBUG', `KCTL_SET_ENV_TS=${Date.now()}`], execaOpts);
		}
	}, 500);

	watcher.on('change', async function (filePath: string) {
		if (filePath.includes(NOT_RESTART_IF_PATH_HAS)) {
			// console.log(`no restart because path contains ${NOT_RESTART_IF_PATH_HAS}`);
		} else {
			cr();
		}
	});

	watcher.on('add', async function (filePath: string) {
		if (filePath.includes(NOT_RESTART_IF_PATH_HAS)) {
			// console.log(`no restart because path contains ${NOT_RESTART_IF_PATH_HAS}`);
		} else {
			cr();
		}
	});
	console.log(`-- started watching ${serviceName}`);
}