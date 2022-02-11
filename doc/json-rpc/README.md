## Why JSON-RPC 2.0 over REST

TLDR; As simple as REST, domain-centric, future proof, and simpler to type and verify.

- **As simple as REST** - From a http protocol point of view, JSON-RPC is a subset of REST, only POST and only JSON, and while it might be a little unfamiliar at first, the medium/long-term benefits are significant.
- **Transport Protocol Agnostic** Supports HTTP as simple as REST, but JSON-RPC is a transport agnostic message-based protocol decoupled from the conduit. It can be used with other conduit schemes of data/command exchange, pub/sub, web socket, inter-process, etc.
- **Application Centric** - Do not need to contort HTTP methods and url paths to Application API semantics (e.g. GET v.s. POST v.s. PUT v.s. PATCH, and Path v.s. Params v.s. Body)
- **Simpler to Type/Verify** - Since everything is JSON Body, simpler to type and verify (e.g., JSON Schema)
- **Support for batch** - Inherently support batching of queries. 

See here the [Quick Intro](quick-intro.md) ([Official json-rpc spec](https://www.jsonrpc.org/specification))

## JSON-RPC Normative Approach

The JSON-RPC Normative approach defines a set of conventions on top of JSON-RPC 2.0 to normalize further remote service calls for consistency, extensibility, and comprehensiveness.

At the high level, there are two types of RPC Calls

- **Query Methods** - Those calls do not change the data but only return one or more datasets. There are designed to have advanced filtering and inclusion capabilities. 
- **Muting Methods** - Those calls focus on changing a particular data, and while it might return the data changed at some granularity, it should not include the same query capability as the first one. 


## Method Names

All JSON-RPC methods will be structured with the following format `[verb][EntityModel][OptionalSuffix]`.

For example, we can have a method like `updateProject` to update the `Project` properties. 

However, if we want to add a `Ticket` to a `Project`, we would have `addProjectTicket` methods. 

> NON-GOAL - By design, this service protocol does NOT require the service to support complete collection management "a-la-ORM" like Hibernate or such. While it is an attractive engineering problem to solve, it often puts too much complexity on one side of the system and ends up counterproductive for both sides. So, to add a `Ticket` to a `Project`, the method is `createTicket` with the params `{projectId: ...}`.

For example, for an entity `Project`:

- `getProject` - Get a single project for a given `id` (the PK of the Project entity)
- `listProjects` - Return the list of project entities based on a `#filters` (criteria) and `#includes` (what to include for reach project item)
- `createProject` - Create the project, and if there is some unicity conflict, it will fail and return an error. 
- `deleteProject` - Delete a project for a given id. 
- `createTicket` - Since ticket has to be owned by a project, the params will be `{data: {projectId: 123}}`
- `saveProject` - (should be rare) The verb `save` will be used for `upsert` capability. It should be exposed only if strictly required by the application model.

Here are the normative method verbs (in the examples below, the `jsonrpc` and `id` are omitted for brevity)

**Muting Methods**

| verb       | meaning                                                    | example                                                                            |
|------------|------------------------------------------------------------|------------------------------------------------------------------------------------|
| `create`   | Create the new given entity                                | `createProject` `{data: {title: "title 1"}}`                                       |
| `update`   | Update the new given entity                                | `updateProject` `{id: 123, data: {title: "title 1 updated"}}`                      |
| `delete`   | Update the new given entity                                | `deleteProject` `{id: 123}`                                                        |
| `save`     | Upsert a new entity (only if strictly needed by app model) | `saveProjectLabel` `{projectId: 123, data: {name: "ImportantFlag", color: "red"}}` |
| `[custom]` | Domain specific verb                                       | `importProject` `{... }`                                                           |

**Query Methods**

| verb       | meaning                                                   | example                                     |
|------------|-----------------------------------------------------------|---------------------------------------------|
| `get`      | Get only one item by PK id                                | `getProject` `{id: 123 }`                   |
| `list`     | List cases based on some                                  | `listProject` `{"@filters": {title:  123 }` |
| `first`    | Params like list, return like get (null if nothing found) | `first` `{"@filters": {title:  "title 1" }` |
| `[custom]` | Domain specific                                           | `lookupProject`                             |

Note - `get` params is fixed, and if another way is needed to get an entity, for example, get user by username, another `getUserByUsername` `{username: "..."}` should be implemented.

## Query Calls Example

The `list` and `first` query are structured the following way. 

All data (array or single object) of all query calls are always in `result.data`.

For example, list projects given some filters and specifying what to include.
```js
{
    jsonrpc: "2.0",
    method: "listProjects",
    params: {
        // narrow the targeted entity result set 
        "#filters": { 
            name: {"$contains": "safari"}
        }, 

        // define what to returned for what has been matched by targeted entity
        "#includes": { 
            ticket: { // includes object 
                title: true,
                timestamp: true, // cid, ctime, mid, mtime
                labels: true, // default to give only "label.name" in this case. can do {timestamp: true, color: true}
                "$filters": {
                    "title": {"$contains": "important"},
                },
            } 
         }, 
    },
    id: null
}
```

The json-rpc `.result.data` will look like this

```js
[
    // project entity
    { 
        name: "Safari Update Project", 
        tickets: [
            {
                title: "This is an important ticket",
                cid: ...,
                ctime: ..., 
                cid: ...,
                mtime: ...,
                labels: [{name: "..."}, {name: "..."}]
            },

        ]
    },
    // project entity
    { ... }

]
```

## Muting Call Example

When calling `create` or `update` muting calls, the convention is that the `params.data` contain the patch entity to be created or updated.

For example, a **create project** call would look like: 

```js
{
    jsonrpc: "2.0",
    method: "createProject",
    params: {
        data: {
            title: "My first project"
        }
    },
    id: null
}
```

Now, to create a ticket for this project (let's say that this projectId is `123`)

```js
{
    jsonrpc: "2.0",
    method: "createTicket",
    params: {
        projectId: 123,
        data: {
            title: "My first project"
        }
    },
    id: null    
}

```

> Note 1: Here, the `projectId` is at the root `params` because it is part of the method call, and not of the `.data` to be created, even if it happens that the **query calls** on `Ticket` entity will return `data.projectId`. 

> Note 2: The goal of this api design is to decouple at the method call the context of the creation (here `.projectId`) from the data to be created (here `.data`), even if it happens that **query calls** will return the same property part of the data. This scheme allows to enforce all **muting calls** `.data` will not contain properties that should not be writable, while accepting necessary context for some **muting calls** as needed (here the `createTicket` needs the `projectId` to do its job)

## Conditional Operators

Filters and Includes allow to express conditional rules base on a `{property: {operator: value}}` scheme. The following table shows the list of possible operators.

| Operator        | Meaning                                       | Example                                    |
|-----------------|-----------------------------------------------|--------------------------------------------|
| `$eq`           | Exact match with one value                    | `{name: {"$eq": "Jon Doe"}}`               |
| `$notEq`        | Exclude any exact match                       | `{name: {"$notEq": "Jon Doe"}}`            |
| `$in`           | Exact match with within a list of values (or) | `{name: {"$in": ["Alice", "Jon Doe"]}}`    |
| `$notIn`        | Exclude any exact withing a list              | `{name: {"$notIn": ["Jon Doe"]}}`          |
| `$contains`     | For string, does a contains                   | `{name: {"$contains": "Doe"}}`             |
| `$containsIn`   | For string, does a contains  (or)             | `{name: {"$containsIn": ["Doe", "Ali"]}}`  |
| `$startsWith`   | For string, does a contains                   | `{name: {"$startsWith": "Jon"}}`           |
| `$startsWithIn` | For string, does a contains  (or)             | `{name: {"$startsWithIn": ["Jon", "Al"]}}` |
| `$endsWith`     | For string, does a contains  (or)             | `{name: {"$endsWithIn": "Doe"}}`           |
| `$endsWithIn`   | For string, does a contains  (or)             | `{name: {"$endsWithIn": ["Doe", "ice"]}}`  |
| `$lt`           | Lesser Than                                   | `{age: {"$lt": 30}}`                       |
| `$lte`          | Lesser Than or =                              | `{age: {"$lte": 30}}`                      |
| `$gt`           | Greater Than                                  | `{age: {"$gt": 30}}`                       |
| `$gte`          | Greater Than or =                             | `{age: {"$gte": 30}}`                      |

The operator sub-parts can be described as below: 
- `not` is a **prefix** when we want to express the negation of another operator. camelCase follows the `not` prefix. 
- `in` is a **suffix** when an operator can take a list of items. It means it will succeed if one of the item match.

> While those operator notations are vaguely inspired by the [mongodb syntax](https://docs.mongodb.com/manual/reference/operator/query/#std-label-query-selectors), they are designed to be more limited and structured (e.g., avoid union types when possible), and not for familiarity. 

## Error Codes

The error codes from and including -32768 to -32000 are reserved for pre-defined errors. 
Any code within this range but not defined explicitly below is reserved for future use. The error codes are nearly the same as those suggested for XML-RPC at the following url: http://xmlrpc-epi.sourceforge.net/specs/rfc.fault_codes.php

| code   | message (enum style)         | meaning                                                    |
|--------|------------------------------|------------------------------------------------------------|
| -32700 | PARSE_NOT_VALID_JSON         | Not a valid JSON                                           |
| -32701 | PARSE_UNSUPPORTED_ENCODING   | parse error. unsupported encoding                          |
| -32702 | PARSE_INVALID_CHAR_ENCONDING | parse error. invalid character for encoding                |
| -32600 | INVALID_JSON_RPC_FORMAT      | The JSON sent is not a valid Request object.               |
| -32601 | JSON_RPC_METHOD_NOT_FOUND    | The method does not exist / is not available.              |
| -32602 | JSON_RPC_PARAMS_INVALID      | The params is invalid for method                           |
| -32603 | JSON_RPC_INTERNAL_ERROR      | Another json-rpc error happened not captured above         |
| -32500 | SERVICE_ERROR                | An unknown service/application error (should try to avoid) |

The following scheme can be followed and extended per application for application-specific errors. 

| code      | message (enum style) | meaning                                             |
|-----------|----------------------|-----------------------------------------------------|
| 1000-1099 | AUTH_...             | Authentication error (missing header, expired, ...) |
| 1100-1199 | ACCESS_...           | Access/Privileges Errors                            |
| 3000-...  | ..._....             | Other Application Errors                            |
| 5000-...  | METHOD_NAME_....     | By method errors                                    |

