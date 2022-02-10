
## Concept

Here is an example of how the format works. 

#### Data Model
Let's say we have the following data model. 

> Note: Here we are expressing in it TypeScript format, but those could be stored as tables in a relational database or object in a mongodb. 

```ts
// A workspace is the top container, like an Repo in GitHub
interface Workspace {
    id: number,
    name: string,
    cid: number, // creator user id
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
    cid: number, // creator user id
    ctime: string, // ISO/UTC date    
}

// User record
interface User {
    id: number,
    username: string, // unique
    fullName: string,
}
```

#### Query Example


**Get All Accessible Workspaces** (Access will be handled by the service returning the result)

`POST https://my-server/api/rpc` (non nomartive)
```js
{
// tbd
}
```