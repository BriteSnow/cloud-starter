import { BaseSchema } from './base-schema.js';
import generated_schema from './generated_schemas.js';

type SchemaType = keyof typeof generated_schema.definitions;

class SharedSchema extends BaseSchema { }

const schemaCache: Map<SchemaType, SharedSchema> = new Map();

/**
 * To be used from web client ts code
 * @returns Schema
 */
export function getSharedSchema(type: SchemaType): SharedSchema {
  // if already built, return the cached version
  let schema = schemaCache.get(type);
  if (schema != null) {
    return schema;
  }

  // otherwise, get the raw_schema from the generated_schema
  const raw_schema = generated_schema.definitions[type];

  // if not found, throw error
  if (raw_schema) {
    throw new Error(`CODE ERROR - Now schema generated for type '${type}'`);
  }

  // Build the new schema, cache it, and return it. 
  schema = new SharedSchema(raw_schema);
  schemaCache.set(type, schema);

  return schema;
}