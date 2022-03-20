
// GENERATED FILE

// DO NOT EDIT MANUALLY   (use 'npm run ts-schema' or edit /scripts/cmd-ts-schema.ts)
const generated_schemas = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "definitions": {
    "OrgRec": {
      "description": "table name: 'org'",
      "type": "object",
      "properties": {
        "id": {
          "type": "number"
        },
        "uuid": {
          "type": "string"
        },
        "type": {
          "$ref": "#/definitions/OrgType"
        },
        "name": {
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
        }
      },
      "required": [
        "cid",
        "ctime",
        "id",
        "mid",
        "mtime",
        "name",
        "type",
        "uuid"
      ]
    },
    "ProjectRec": {
      "description": "table name: 'project'",
      "type": "object",
      "properties": {
        "id": {
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
        "orgId": {
          "type": "number"
        }
      },
      "required": [
        "cid",
        "ctime",
        "id",
        "mid",
        "mtime",
        "name",
        "orgId",
        "uuid"
      ]
    },
    "TicketRec": {
      "description": "table name: 'project'",
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
        "orgId": {
          "type": "number"
        }
      },
      "required": [
        "cid",
        "ctime",
        "id",
        "mid",
        "mtime",
        "orgId",
        "title",
        "uuid"
      ]
    },
    "UserRec": {
      "description": "table name: 'user'",
      "type": "object",
      "properties": {
        "id": {
          "type": "number"
        },
        "uuid": {
          "type": "string"
        },
        "username": {
          "type": "string"
        },
        "fullName": {
          "type": "string"
        },
        "role": {
          "$ref": "#/definitions/GlobalRole"
        },
        "pwd": {
          "type": [
            "null",
            "string"
          ]
        },
        "psalt": {
          "type": "string"
        },
        "pwdHistory": {
          "anyOf": [
            {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            {
              "type": "null"
            }
          ]
        },
        "tsalt": {
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
        }
      },
      "required": [
        "cid",
        "ctime",
        "id",
        "mid",
        "mtime",
        "psalt",
        "pwd",
        "pwdHistory",
        "role",
        "tsalt",
        "username",
        "uuid"
      ]
    },
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
    "OrgType": {
      "enum": [
        "personal",
        "shared"
      ],
      "type": "string"
    },
    "GlobalRole": {
      "enum": [
        "r_sys",
        "r_user"
      ],
      "type": "string"
    }
  }
}

// DO NOT IMPORT DIRECTLY (use 'import { getSchema } from "#common/ts-schema/index.js"')
export default generated_schemas;
