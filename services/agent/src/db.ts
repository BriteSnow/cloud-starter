import { psqlImport, pgStatus, pgTest, list, download } from 'vdev';
import { router } from 'cmdrouter';
import * as fs from 'fs-extra-plus';
import { basename, join as joinPath } from 'path';
import { ensureDir } from 'fs-extra-plus';


const sqlDir = 'sql';
const host = 'cstar-db-srv';

const dbPrefix = 'cstar_';
const dbOpts = { user: dbPrefix + "user", db: dbPrefix + "db", host: host };

router({ updateDb: runDropSqls, recreateDb }).route();


// --------- Commands --------- //
// user for dev
async function recreateDb() {
	if (!(await checkRunning())) {
		return;
	}

	//// Drop the bb_ db and user
	const t = await pgTest(dbOpts);
	if (t.success) { // drop only if exist
		// local test: // psql -U postgres -d postgres -f sql/_drop-db.sql
		await psqlImport({ user: "postgres", db: "postgres", host }, [`${sqlDir}/_drop-db.sql`]);
	}

	const allSqlFiles = await fs.glob('*.sql', sqlDir);

	//// create the bb_... database / user
	// local test: psql -U postgres -d postgres -f sql/00_create-db.sql
	await psqlImport({ user: "postgres", db: "postgres", host }, [`${sqlDir}/00_create-db.sql`]);

	//// Option 1) At the beginning, load from sql
	const sqlFiles = filterNumbered(allSqlFiles, 1);
	await psqlImport(dbOpts, sqlFiles);

	//// Option 2) When app is in prod, this will take the data from prod
	//await loadProdDb();


	//// 6) Import the drop sqls
	await runDropSqls();
}


async function runDropSqls() {
	try {
		// TODO: need to gets the db changelog first, to run only what is missing.
		const dropFiles = await fs.glob('drop-*.sql', sqlDir);
		console.log('dropFiles\n', dropFiles);
		await psqlImport(dbOpts, dropFiles);
	} catch (ex) {
		console.log('Failed updatedb: ', ex);
	}
}

async function loadProdDb() {
	//// 3) Download the last dev prod sql (will be deintified later)
	const remoteFiles: any[] = await list({ store: 'dev', path: '**/*.sql' });
	const lastDbSqlStoragePath = remoteFiles[remoteFiles.length - 1].path;

	const tmpProdSqlDir = '~tmp/sql/';
	const prodFileName = basename(lastDbSqlStoragePath);

	await ensureDir(tmpProdSqlDir);
	await download({ store: 'dev', path: lastDbSqlStoragePath }, tmpProdSqlDir);

	//// 4) Import the prod sql
	// local test: psql -U bb_user -d bb_db -f ~tmp/sql/prod-db.sql
	await psqlImport(dbOpts, [joinPath(tmpProdSqlDir, prodFileName)]);

	//// 5) Reset the passwords to welcome (clear)
	await psqlImport(dbOpts, [`${sqlDir}/_reset-passwords.sql`]);


}



// --------- /Commands --------- //


// --------- Private Utils --------- //

async function checkRunning(): Promise<boolean> {
	const status = await pgStatus({ host });
	if (!status.accepting) {
		console.log(`Database not ready (${status.message})`);
	}
	return status.accepting;
}


/** Filter a list of file by their starting number (and exclude any file name that does not start with a number) */
function filterNumbered(allFiles: string[], from = 0, to?: number) {
	const rgx = /^\d+/;
	const files: string[] = [];
	for (const file of allFiles) {
		const name = basename(file);
		const m = name.match(rgx);
		if (m) {
			const num = parseInt(m[0], 10);
			if (num >= from && (!to || num <= to)) {
				files.push(file);
			}
		}
	}
	return files;
}
// --------- /Private Utils --------- //