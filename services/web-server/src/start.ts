import { __version__ } from '#common/conf.js';
import { KoaApp } from '#common/web/koa-app.js';
import dseGenerics from './web/dse-generics.js';
import dseMedia from './web/dse-media.js';
import dseWks from './web/dse-wks.js';
import routerAuthGoogleOAuth from './web/router-auth-google-oauth.js';

const PORT = 8080;

main();

async function main() {

	const app = new KoaApp({
		token_name: 'token',
		beforeAuthMdws: [
			routerAuthGoogleOAuth().middleware()
		],
		apiMdws: [
			dseWks('/api').middleware(),
			dseMedia('/api').middleware(),
			dseGenerics('/api').middleware()
		]
	});

	await app.setup();

	app.start(PORT);

	console.log(`--> web-server (${__version__}) - listening at ${PORT}`);
}

