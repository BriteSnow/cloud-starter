import { router } from 'cmdrouter';
import * as fs from 'fs-extra-plus';
import * as path from 'path';
import { sketchdev } from 'sketchdev';
import { loadBlock, now, printLog } from 'vdev';

export const SKETCH_FILE = '../design/cstar-design.sketch';

router({ ico }).route();


export async function ico() {
	const block = await loadBlock('web');
	const webDir = block.baseDistDir!;

	if (await fs.pathExists(SKETCH_FILE)) {
		const start = now();

		// Delete the existing temp files
		await fs.saferRemove('./~design/~sketchdev-dist/');
		const sketchDistDir = './~design/~sketchdev-dist/';

		// process icons `ico/_name_/_num` where _num is any number (usually 24)
		await sketchdev(SKETCH_FILE).exportIcons(sketchDistDir);


		// copy the sprite.svg and demo.html to webFolder
		const webSvgDir = path.join(webDir, './svg');
		await fs.mkdirs(webSvgDir);
		await fs.copy(path.join(sketchDistDir, 'sprite/'), webSvgDir);

		// print info
		await printLog("ico", start, path.join(webSvgDir, 'sprite.svg'));
	} else {
		console.log(`ico - Sketch app file ${SKETCH_FILE} does not exist (skipping)`);
	}
}