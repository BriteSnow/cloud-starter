# TypeScript & Modern ES/JS Best Practices 

Best practices for modern ES / TS coding. 


## Object - basic - variable extraction, value access, building

```ts
// 1) USE null chaining/coalescing to extract deep data
// 2) USE explicit variable types for data structure when possible
const filter: Filter = panel?.options?.filter ?? {};

// 3) USE Destructuring to initialize variables (ts type will carry over)
const { labelIds, excludeLabelIds } = filter;

// 4) USE single name/value object literal when possible.
const labelFilter = { labelIds, excludeLabelIds };
```


## Object - create variant

```ts
// 1) Create variant of object with spread syntax and overriding given property
// 2) Set the type for receiving variable (here Filter) to guarantee expected type
const filterForOpen: Filter = {...filter, state: 'open'};
const filterForColose: Filter = {...defaultFilter, ...filter, state: 'close'};

// type example (for above)
type Filter = {name?: string, state?: 'open' | 'close' | 'both' , labelIds?: number[] };
```

- spread syntax : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax


## Object - Object Literal & Interface v.s. Class

```ts
// 1) USE object literal and TS interfaces for most data structure
const user: User = {id, username};

// 2) USE class when inheritance, behavior, or annotation must be part of the object 
//    (e.g., Daos, UserContextImpl, Logger<LogRecord>)
const userDao = new UserDao();
```


## Object - When to use Object v.s. Map

- **USE object** (or class) and TS Interfaces for ALL data structure that can be express via interface, type, or class. For example when fix set of property names. Use object literal and spread merging when possible.

- **USE Map** or Set as data container with fix key type and value type (i.e., `Map<number, Ticket>()`). Similar to array or Set, especially when key/value can grow or shrink. For exampe: 
	- Caches, dictionaries (temporary in a function, or global)
	- When key/value can grow and shrink.

- **CAN USE object** for representating a simple static and relatively name/value data set when dot access (e.g., `.name: true/false`) is preferred (e.g., for UI string templating). 
	- Good example is to represent privilege access and `${privileges.comment ? '<button>add</button>' : ''` format (flags, roles, privileges), Small list of names that are usually built once as object. 

- DO NOT USE object has a hashmap when elements can grow and shrink. This is what Maps are for. 

```ts
//// Map Example - local dictionary
const tickets: Ticket[] = loadTickets();
// To Map
const ticketsById = new Map(tickets.map((t): [number, Ticket] => [t.id!, t])); 

for (...){
	if (ticketsById.has(ticketId)){
		...
	}
}

//// Object Example - Acceptable use of object as static list of name/value
const FLAG_NAMES = Object.freeze(['foo', 'bar'] as const);
type Flag = typeof FLAG_NAMES[number]; // type: 'foo' | 'bar'

type Flags = {[flag in Flag]?: boolean};
const flagsArr: Flag[] = ['foo']; // could come from database

// Here we create the object once, which will ave a config 
const flags: Flags = flagsArr.reduce((obj: any, v) => (obj[v] = true, obj), {});
```


## Array - concat 

- **USE push with spread** `arr1.push(...arr2)` when adding in place, and `arr2` is relatively small (< 100).

- **USE spread** `[...arr1, ...arr2]` when new array is preferred. 

- **USE concat** `arr1.concat(arr2)` when `arr2` is multiple thousands of items or above. This will create a new array, however [.concat is still faster than in place push on big arrays](https://jsperf.com/big-array-concat-spread-push). (performance gain negligeable relative to application though)

- **USE push item** `arr1.push(item)` when adding in place one item at a time.

- DO NOT USE `Array.prototype.push.apply(arr1, arr2)` anymore, the `arr1.push(...arr2)` spread is as fast and much more concise and readable.

### Examples:


```ts
let arr1 = [1, 2];
let arr2 = [3, 4];

// in place concat use spread syntax
arr1.push(...arr2, 5, 6);
// arr1: [1, 2, 3, 4, 5, 6]

// new array concat, with spread syntax
[...arr1,...arr2, 5, 6] 

// new array concat, (fastest when arr2 is big, but favor readibility, nano-optimization at best)
arr1.concat(arr2, [5, 6]);

// Bonus: Remove duplication (only if primary types, no object)
let [...new Set([...array1 ,...array2])];
```

> **Note 1**: `concat` is faster for adding big arrays probably because the internal implementation might avoid some of the push operation overhead. So, on small arrays, the concat setup overhead might be higher, but as the added arrays get bigger `.concat` setup overhead becomes negligeable compared to the optimization benefits (note: this is guesstimate, and not based on actual internal code study).

> **Note 2**: While there is an absolute speed difference between `.concat` and push or spread when adding big arrays, it is probably still negligeable compared to the overall applications logic. Therefore, favor readability over micro-optimization. Just for info, here some jsperf [big arrays](https://jsperf.com/big-array-concat-spread-push) v.s. [small arrays](https://jsperf.com/small-array-concat-spread-push)


## Array - to Map

```ts
const tickets: Ticket[] = loadTickets();

// To Map
const ticketsById = new Map(tickets.map((t): [number, Ticket] => [t.id!, t])); 
// infer correct Map<number, Ticket>, because of (t): [number, Ticket] 

```

## Array - to object with Array.reduce

- USE ONLY when the object is a data structure (i.e., keys are property names)

```ts
const names = ['prop1', 'prop2'];
const object = names.reduce((obj: any, v) => (obj[v] = true), {}); 
// {one: true, three: true}
```

## Time - now, moment, timezone

- **USE Date.now** `const now = Date.now()` to get the now time number. 

- **USE [moment](https://www.npmjs.com/package/moment)** for more date/format manipulation. 

- **USE [moment-timezone (superset)](https://www.npmjs.com/package/moment-timezone)** when timezone needed (should used for services)

- DO NOT USE `new Date().getTime()` (longer, less readable, does not add any value compared to `Date.now()`)

## Type - property names from array

- **USE as const and typeof[number]** to type a list of property names and typescript types
	> Note: This allows to get the list of names accessible in javascript code (for validations or sql column names), as well as typescript typing for stronger and more expressive typing. 

### Example: 

```ts
const FLAG_NAMES = Object.freeze(['foo', 'bar'] as const);
type Flag = typeof FLAG_NAMES[number]; // type: 'foo' | 'bar'

// flags object
type FlagObj = {[flag in Flag]?: boolean}
const flags: Flag[] = ['foo'];
const flagsObj = flags.reduce((obj: any, v) => (obj[v] = true, obj), {});

```


## Typeguards - assertTypeName & isTypeName

- **USE `isTypeName`** Typescript `val is type` to check and set the type of an object.
```ts
// USE isTypeName naming convention
export function isUserContext(obj: any): obj is UserContext{
	return (obj instanceof UserContextImpl);
}


//// Usage:

if (isUserContext(someObject)){
  // Now someObject is guaranteed to be UserContext type
  someObject.userId; // valid
}
```

- **USE `assertTypeName`** Typescript `asserts` to guarantee type correctness (when exception is preferred)

```ts
// USE assertTypeName convention
export function assertUserContext(obj: any): asserts obj is UserContext {
	if (!(obj instanceof UserContextImpl)) {
		throw new Error(`Object is not of type UserContext ${obj?.constructor.name}`);
	}
}


//// Usage:

assertUserContext(someObject);
// Now someObject is guaranteed to be UserContext type
someObject.userId; // valid
```

> NOTE: Both `isTypeName` and `assertTypeName` can be implemented for the same time. When the code cannot proceed if the type is not correct, use the `asserTypeName`, and when it can, use `isTypeName`. 

- DO NOT USE `assertTypeName` with an empty/silent catch `catch {}` as the `isTypeName` is the right pattern for this case. 


## Debug - Console.log

Prefix all DEBUG `console.log` message with `->>` and NEVER commit them to a shared branch. 

Example: 

```ts
// ... some code
console.log('->> here are some value:', value);
// ... some code
```

This allows quick full search with `->>` which is unique enough to just show the debug concole log. If another developer forgot to remove one of those DEBUG `console.log` it will be simple to find out. 

> IMPORTANT: DEBUG `console.log` should NEVER be commited in any branch that will be pushed to a repo. Can be part of local commits while development a feature, but needs to be removed when finalizing the commit. The application loggin system should be used to log information that the application might need. 


## Blog posts and articles

- [cjs vs AMD vs UMD vs ESM](https://dev.to/iggredible/what-the-heck-are-cjs-amd-umd-and-esm-ikm)