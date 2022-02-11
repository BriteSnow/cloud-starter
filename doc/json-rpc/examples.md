**>>>> NOT COMPLETE<<<<**

# Data Model
Let's say we have the following data model. 

> Note: Here we are expressing in it TypeScript format, but those could be stored as tables in a relational database or object in a mongodb. 

```ts
// A workspace is the top container, like an Repo in GitHub
interface Workspace {
    id: number,
    name: string,
    cid: number, // creator user_id
    ctime: string, // ISO/UTC date
}

// A workspace can have one or more projects
interface Project {
    workspaceId: number;
    id: number,
    name: string,
    cid: number, // creator user id
    ctime: string, // ISO/UTC date
}

// Tickets (todos, issues, ...) belong to a project
interface Ticket {
    projectId: number,
    title: string,
    cid: number, // creator user_id
    ctime: string, // ISO/UTC date    
}

// User record
interface User {
    id: number,
    username: string, // unique
    fullName: string,
}
```

# Get All Workpaces

### Request

`POST https://my-server/api/rpc` (non nomartive)
```js
{
    jsonrpc: "2.0", 

    method: "getWorkspaces", 

    // No need for params in this case

    id, "some_client_id_per_request", 
}
```

### Response

```js
{
    jsonrpc: "2.0", 
    result: {
        data: [
            {
                id: 123, // workspace id
                name: "Workspace 01"
            }, 
            { ... }
        ]
    }, 

    // REQUIRED (will match the corresponding json-rpc request)
    id: "some_client_id_per_request", 
}

```


# Get all Projects for one workspace

List all of the projects with `workspaceId` matching one of the value in the array `[123, 124]`

### Request

`POST https://my-server/api/rpc` (non nomartive)
```js
{
    jsonrpc: "2.0", 

    method: "listProjects", 

    params: {
        "#filters": {
            workspaceId: {$in: [123, 124]}
        }
    }

    id, "some_client_id_per_request", 
}
```

### Response

```js
{
    jsonrpc: "2.0", 
    result: {
        data: [
            { // project from workspace 123
                id: 1, 
                workspaceId: 123,
                name: "Project 01"
            }, 
            { // project from workspace 123
                id: 2, 
                workspaceId: 123,
                name: "Project 02"                
            },
, 
            { // project from workspace 124
                id: 3, 
                workspaceId: 124,
                name: "Project 03"                
            }            
        ]
    }, 

    id: "some_client_id_per_request", 
}

```

