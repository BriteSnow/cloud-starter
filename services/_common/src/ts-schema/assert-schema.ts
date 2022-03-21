import { TicketForPatch } from '#shared/entities/index.js';
import Ajv from "ajv";
import generated_schema from './generated_schemas.js';

const ajv = new Ajv({ allErrors: true });
ajv.addSchema(generated_schema);

export function assertTicketForPatch(obj: any): asserts obj is TicketForPatch {
  const type = 'TicketForPatch';
  try {
    const valid = ajv.validate(`#/definitions/${type}`, obj);
    console.log('->> assertTicketForPatch ', obj, valid, ajv.errors);

  } catch (ex: any) {

    console.log(`ASSERT TYPE '${type} failed.`, ex);
    throw Error(`ASSERT TYPE '${type} failed ${ex}`)
  }


}