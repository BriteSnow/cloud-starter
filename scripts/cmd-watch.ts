import chokidar from 'chokidar';
import { router } from 'cmdrouter';
import { execa } from 'execa';
import debounce from 'lodash.debounce';
import * as Path from 'path';
import { wait } from 'utils-min';

const IMG_NAME_PREFIX = 'cstar-';
const NOT_RESTART_IF_PATH_HAS = '/test/';

const { stdout, stderr } = process;
const execaOpts = Object.freeze({ stdout, stderr });

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

	// watchService('vid-init', '9240');
	// watchService('vid-scaler', '9241');
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
	const podNameArgs = ['get', 'pods', '-l', `run=${IMG_NAME_PREFIX}${serviceName}`, '--no-headers=true', '-o', 'custom-columns=:metadata.name'];
	const podName = (await execa('kubectl', podNameArgs)).stdout?.trim();

	// spawn('kubectl', ['port-forward', podName, `${debugPort}:9229`]);
	execa('kubectl', ['port-forward', podName, `${debugPort}:9229`]);

	// make sure it listen to port
	await wait(2000);

	// spawn('tsc', ['-w'], { cwd: serviceDir }); // this will create a new restart
	execa('tsc', ['-w'], { cwd: serviceDir });

	// console.log('waiting for tsc -w');
	await wait(2000);

	const distDir = Path.join(serviceDir, '/dist/');
	const watcher = chokidar.watch(distDir, { depth: 99, ignoreInitial: true, persistent: true });

	const cr = debounce(() => {
		console.log(`... kexec ${serviceName} -- /bin/bash -c "/service/restart.sh"`);
		execa('kdd', ['kexec', serviceName, '--', '/bin/bash', '-c', '"/service/restart.sh"']);
	}, 500)

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