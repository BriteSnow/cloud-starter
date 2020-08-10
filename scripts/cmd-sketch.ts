import { router } from 'cmdrouter';
import * as fs from 'fs-extra-plus';
import * as Path from 'path';
import { sketchdev } from 'sketchdev';
import { loadBlocks, now, printLog } from 'vdev';

export const SKETCH_FILE = '.design/cba-design.sketch';
export const SKETCH_ICO_DIST_DIR = '.sketchdev-ico-dist/';
export const SKETCH_CIM_DIST_DIR = '.sketchdev-cim-dist/';

const COMMON_DIR = './frontends/_common/'

router({ sketch }).route();

/** Export the sketch assets */
export async function sketch() {
	await ico();
	await style();
}

async function style() {
	if (await fs.pathExists(SKETCH_FILE)) {
		const start = now();
		const { web: webDir } = await loadWebFolders();
		const sketch = await sketchdev(SKETCH_FILE);
		const outFile = Path.join(COMMON_DIR, 'pcss/common-colors.pcss');
		await sketch.exportStyles({
			outFile,
			styleName: 'fill/',
			group: 2, // to group styles in the .pcss output file
			ref: ['fill/prime', 'fill/gray', 'fill/second'],
			replace: [/^fill/, 'clr']
		});
		await printLog('sketch colors', start, outFile);
	};

}

async function ico() {


	if (await fs.pathExists(SKETCH_FILE)) {
		const { web: webDir } = await loadWebFolders();
		const start = now();

		// Create icons
		await fs.saferRemove(SKETCH_ICO_DIST_DIR);
		const webFolderSvgDir = Path.join(webDir, './svg');
		// const adminFolderSvgDir = Path.join(adminDir, './svg');

		await sketchdev(SKETCH_FILE).exportIcons(SKETCH_ICO_DIST_DIR, {
			artboardName: 'ico/', // startsWith
			out: Path.join(SKETCH_ICO_DIST_DIR, 'svg/'),
		});
		await fs.mkdirs(webFolderSvgDir);

		await fs.copy(Path.join(SKETCH_ICO_DIST_DIR, 'sprite/'), webFolderSvgDir);
		const svgFile = Path.join(webFolderSvgDir, 'sprite.svg');
		// await fs.copy(svgFile, Path.join(adminFolderSvgDir, 'sprite.svg')); // add it to the admin dir
		await printLog("ico", start, Path.join(webFolderSvgDir, 'sprite.svg'));

	} else {
		console.log(`ico - Sketch app file ${SKETCH_FILE} does not exist (skipping)`);
	}
}

// First Pass Design -> First Pass Impl
//     Second Pass Design -> Second Pass Impl


async function loadWebFolders(): Promise<{ web: string }> {
	const blocks = await loadBlocks();
	// const admin = blocks.admin.baseDistDir!;
	const web = blocks.web.baseDistDir!;
	return { web };
}