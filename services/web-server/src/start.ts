require('../../_common/src/setup-module-aliases');

import { __version__ } from 'common/conf';
import { KoaApp } from 'common/web/koa-app';
import dseGenerics from './web/dse-generics';
import dseMedia from './web/dse-media';
import dseWks from './web/dse-wks';
import routerAuthGoogleOAuth from './web/router-auth-google-oauth';

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



