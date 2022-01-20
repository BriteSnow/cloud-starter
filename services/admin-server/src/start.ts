import { __version__ } from '#common/conf.js';
import { KoaApp } from '#common/web/koa-app.js';

const PORT = 8081;

main();

async function main() {

	const app = new KoaApp({
		token_name: 'admin_token',
	});

	await app.setup();

	app.start(PORT);

	console.log(`--> admin-server (${__version__}) - listening at ${PORT}`);
}

