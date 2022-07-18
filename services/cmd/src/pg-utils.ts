import { execa } from 'execa';

// for execa
const { stdout, stderr } = process;
const execaOpts = Object.freeze({ stdout, stderr });


export type PsqlOptions = {
  user?: string,
  password?: string,
  database?: string,
  host?: string,
  port?: string,
  toConsole?: boolean;
}

const defaultPsqlOptions = {
  toConsole: true
}

// --------- psql public API --------- //
export type PsqlImportItem = { file: string, stdout?: string, stderr?: string };

// NOTE: for now, ignore pgOpts.pwd
export async function psqlImport(pgOpts: PsqlOptions, filePaths: string[]): Promise<PsqlImportItem[]> {
  pgOpts = { ...defaultPsqlOptions, ...pgOpts };
  const items: PsqlImportItem[] = [];
  if (typeof filePaths === "string") {
    filePaths = [filePaths];
  }

  for (let file of filePaths) {

    const item: PsqlImportItem = { file };

    const { stdout, stderr } = await execPsql(pgOpts, ["-f", file])

    item.stdout = stdout;
    item.stderr = stderr;
    items.push(item);

    if (stderr) {
      const err: Error & { items?: PsqlImportItem[] } = new Error(`psqlImport ERROR for file ${file}:\n${item.stderr}`);
      err.items = items;
      throw err;
    }
  }

  return items;

}

export async function psqlCommand(pgOpts: PsqlOptions, command: string): Promise<string> {

  const { stdout, stderr } = await execPsql({ ...pgOpts, toConsole: true }, [`--command=${command}`]);

  if (stderr) {
    throw Error(`ERROR - cannot psqlCommand "${command}" because ${stderr}`);
  }

  return stdout;

}

// --------- /psql public API --------- //

// --------- Utils public API --------- //
export type PgTestResult = { success: boolean, message?: string, err?: string };

export async function pgTest(pgOpts: PsqlOptions): Promise<PgTestResult> {
  const status = await pgStatus(pgOpts);

  if (!status.accepting) {
    return { success: false, message: status.message };
  }
  // --command="SELECT version();

  // var args = buildPgArgs(pgOpts);
  const { args, env } = buildPgArgs(pgOpts);
  args.push("--command=SELECT version()");
  const p = await execa('psql', args, { env });
  if (p.exitCode === 0) {
    return { success: true, message: p.stdout!.trim() };
  } else {
    const r: PgTestResult = { success: false, message: p.stdout! };
    if (p.stderr) {
      r.err = p.stderr.trim();
    }
    return r;
  }
}

export type PgStatusResult = { accepting: boolean, message: string, code: number };
/** Return the status of a pg database process (without the database) */
export async function pgStatus(pgOpts: PsqlOptions): Promise<PgStatusResult> {
  const { args, env } = buildPgArgs(pgOpts);
  //args.push('-q'); // for the quiet mode, we just need to result code
  const p = await execa('pg_isready', args, { env });
  const code = p.exitCode;
  const message = p.stdout.trim();
  const accepting = (0 === p.exitCode) ? true : false;
  return { accepting, message, code };
}

// --------- /Utils public API --------- //


// --------- Private Utils --------- //
async function execPsql(pgOpts: PsqlOptions, args: string[]): Promise<{ stdout: string, stderr: string }> {

  const { args: baseArgs, env } = buildPgArgs(pgOpts);

  // add the args at the end
  args = [...baseArgs, ...args];

  const spawnResult = await execa('psql', args, { env, ...execaOpts });

  let { stdout, stderr } = spawnResult;

  if (stderr) {
    const err = stderr.trim();
    let itemErr = null;
    for (const line of err.split('\n')) {
      if (!line.includes("NOTICE:")) {
        itemErr = (itemErr == null) ? line : `${itemErr}\n${line}`;
      }
    }
    stderr = itemErr ?? '';
  }

  return { stdout: stdout ?? '', stderr: stderr ?? '' };
}


// private: Build a cmd line argument list from a pgOpts {user, db[, pwd][, host][, port: 5432]} and make it an command line arguments
function buildPgArgs(pgOpts: PsqlOptions): { args: string[], env: { [name: string]: string | undefined } } {
  var args = [];

  if (pgOpts.user) {
    args.push("-U", pgOpts.user);
  }
  if (pgOpts.database) {
    args.push("-d", pgOpts.database);
  }
  if (pgOpts.host) {
    args.push("-h", pgOpts.host);
  }
  if (pgOpts.port) {
    args.push("-p", pgOpts.port);
  }

  const env = (pgOpts.password == null) ? process.env : { ...process.env, PGPASSWORD: pgOpts.password };

  return { args, env };
}
// --------- /Private Utils --------- //
