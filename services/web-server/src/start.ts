import { __version__ } from '#common/conf.js';
import { KoaApp } from '#common/web/koa-app.js';
import { execa } from 'execa';
import dseGenerics from './web/dse-generics.js';
import dseMedia from './web/dse-media.js';
import dseWks from './web/dse-wks.js';
import routerAuthGoogleOAuth from './web/router-auth-google-oauth.js';


const PORT = 8080;


main();

async function main() {

	// -- CHECK - that bash environment are set correctly otherwise fail early. 
	try {
		const out = await execa("which", ["ss3"]);
	} catch (ex) {
		console.log(`FATAL ERROR - It seems 'which ss3' failed. /bin/bash does not seem to be setup with the right environment variables`, ex);
	}

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

	console.log(`--> web-server (${__version__}) - listening at ${PORT} ->> 333`);
}


// TODO - listen to the SIGTERM event to start cleanup
// some inputs - https://blog.risingstack.com/graceful-shutdown-node-js-kubernetes/
process.on('SIGTERM', function onSigterm() {
	console.info('Got SIGTERM. Graceful shutdown start', new Date().toISOString());
	// TODO - set flag so that /health should return 500
	// TODO - stop accepting new request
	// TODO - gzip and upload remaining logs
});
