import { readdirSync, writeFileSync } from 'fs';
import * as TJS from "typescript-json-schema";

const REC_TYPES = ['OrgRec', 'ProjectRec', 'TicketRec', 'UserRec'];
const REC_DIR = 'services/_common/src/da/records';

const ENT_TYPES = ['Project', 'Ticket', 'TicketForCreate', 'TicketForPatch'];
const ENT_DIR = 'shared/src/entities';

const COMMON_TS_SCHEMA_FILE = 'services/_common/src/ts-schema/generated_schemas.ts';
const SHARED_TS_SCHEMA_FILE = 'shared/src/ts-schema/generated_schemas.ts';

// Note - List the types dir first level types (ignore sub folders)
const recFiles = readdirSync(REC_DIR)
  .filter((fileName) => fileName.endsWith('.ts'))
  .map((fileName) => `${REC_DIR}/${fileName}`);

const entFiles = readdirSync(ENT_DIR)
  .filter((fileName) => fileName.endsWith('.ts'))
  .map((fileName) => `${ENT_DIR}/${fileName}`);

// optionally pass argument to schema generator
const settings: TJS.PartialArgs = {
  required: true
};

// optionally pass ts compiler options
const compilerOptions: TJS.CompilerOptions = {
  strictNullChecks: true
};

run();

async function run() {

  // Generate the server schemas
  await gen([...recFiles, ...entFiles], [...REC_TYPES, ...ENT_TYPES], COMMON_TS_SCHEMA_FILE);

  // Generate the shared schemas
  await gen(entFiles, ENT_TYPES, SHARED_TS_SCHEMA_FILE);

}

async function gen(files: string[], types: string[], dest_file: string) {
  const program = TJS.getProgramFromFiles(
    files,
    compilerOptions
  );

  const generator = TJS.buildGenerator(program, settings)!;

  for (const type of types) {
    TJS.generateSchema(program, type, settings, [], generator);
  }

  const schema = generator.getSchemaForSymbols(types);

  const json_content = JSON.stringify(schema, null, 2);

  const file_content = `
// GENERATED FILE

// DO NOT EDIT MANUALLY   (use 'npm run ts-schema' or edit /scripts/cmd-ts-schema.ts)
const generated_schemas = ${json_content}

// DO NOT IMPORT DIRECTLY (use 'import { getSchema } from "#common/ts-schema/index.js"')
export default generated_schemas;
`;

  writeFileSync(dest_file, file_content, 'utf-8');
}