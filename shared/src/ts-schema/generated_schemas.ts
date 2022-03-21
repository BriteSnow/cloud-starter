
// GENERATED FILE

// DO NOT EDIT MANUALLY   (use 'npm run ts-schema' or edit /scripts/cmd-ts-schema.ts)
const generated_schemas = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "definitions": {
    "Project": {
      "description": "Project entity model when read from the DAO\ntable name: 'project'",
      "type": "object",
      "properties": {
        "id": {
          "minimum": 123,
          "type": "number"
        },
        "uuid": {
          "type": "string"
        },
        "name": {
          "type": "string"
        },
        "desc": {
          "type": "string"
        },
        "cid": {
          "type": "number"
        },
        "ctime": {
          "type": "string"
        },
        "mid": {
          "type": "number"
        },
        "mtime": {
          "type": "string"
        },
        "org": {
          "type": "object",
          "properties": {
            "id": {
              "type": "number"
            },
            "name": {
              "type": "string"
            }
          },
          "required": [
            "id",
            "name"
          ]
        }
      },
      "required": [
        "cid",
        "ctime",
        "id",
        "mid",
        "mtime",
        "name",
        "org",
        "uuid"
      ]
    },
    "Ticket": {
      "description": "Ticket entity model when read from the DAO\ntable name: 'ticket'",
      "type": "object",
      "properties": {
        "id": {
          "type": "number"
        },
        "uuid": {
          "type": "string"
        },
        "title": {
          "type": "string"
        },
        "desc": {
          "type": "string"
        },
        "cid": {
          "type": "number"
        },
        "ctime": {
          "type": "string"
        },
        "mid": {
          "type": "number"
        },
        "mtime": {
          "type": "string"
        },
        "org": {
          "type": "object",
          "properties": {
            "id": {
              "type": "number"
            },
            "name": {
              "type": "string"
            }
          },
          "required": [
            "id",
            "name"
          ]
        }
      },
      "required": [
        "cid",
        "ctime",
        "id",
        "mid",
        "mtime",
        "org",
        "title",
        "uuid"
      ]
    },
    "TicketForCreate": {
      "type": "object",
      "properties": {
        "title": {
          "type": "string"
        },
        "projectId": {
          "type": "string"
        },
        "desc": {
          "type": "string"
        }
      },
      "required": [
        "projectId",
        "title"
      ]
    },
    "TicketForPatch": {
      "description": "For rpc/dao update. (id will be passed as a parent parameters)",
      "type": "object",
      "properties": {
        "title": {
          "type": "string"
        },
        "desc": {
          "type": "string"
        }
      }
    }
  }
}

// DO NOT IMPORT DIRECTLY (use 'import { getSchema } from "#common/ts-schema/index.js"')
export default generated_schemas;
