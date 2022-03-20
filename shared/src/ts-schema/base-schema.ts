

export class BaseSchema {
  #raw_schema: any;
  #propertyNames: string[];

  constructor(raw_schema: any) {
    this.#raw_schema = raw_schema;
    this.#propertyNames = Object.keys(raw_schema.properties);
  }

  get propertyNames() {
    return this.#propertyNames
  }
}