# Best Practices 

Best practices for modern ES / TS coding. 


## Object - extract and rebuild 

```ts
// 1) Use null chaining/coalescing to eventual data
const filter = panel?.options?.filter ?? {};

// 2) Use Destructuring to get the variable
let { glabelIds, excludeGLabelIds, state, gassigneeId, gauthorId, gmilestoneId } = filter;

// Rebuild the new object with some or all variables
const gissueQueryOptions: GIssueQueryOptions = { grepoId, glabelIds, excludeGLabelIds, state, gassigneeId, gauthorId, gmilestoneId };
```


## Object - create variant

```ts
// type example
type Filter = {name: string, state: 'open' | 'close' | 'both' , priority: number}; // type example

// ... some code that initialize name, state, prioerties as above. 

// 1) Use single name object literal when possible
const filter: Filter = { name, state, priority};

// 2) Create variant of object with spread syntax and overriding given property
const filterForOpen = {...filter, state: 'open'};
const filterForColose = {...filter, state: 'close'};

```

- spread syntax : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax


## Array - concat 

- Use `arr1.push(...arr2)` when adding in place, and `arr2` is relatively small (< 100).

- Use spread `[...arr1, ...arr2]` when new array is preferred. 

- Use concat `arr1.concat(arr2)` when `arr2` is multiple thousands of items or above). This will create a new array, however [.concat is still faster than in place push on big arrays](https://jsperf.com/big-array-concat-spread-push). (performance gain negligeable relative to application though)

- Use `arr1.push(item)` when adding in place one item at a time.


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

- DO NOT use `Array.prototype.push.apply(arr1, arr2)` anymore, the `arr1.push(...arr2)` spread is as fast and much more concise and readable.

<br />


> **Note 1**: `concat` is faster for adding big arrays probably because the internal implementation might avoid some of the push operation overhead. So, on small arrays, the concat setup overhead might be higher, but as the added arrays get bigger `.concat` setup overhead becomes negligeable compared to the optimization benefits (note: this is guesstimate, and not based on actual internal code study).

> **Note 2**: While there is an absolute speed difference between `.concat` and push or spread when adding big arrays, it is probably still negligeable compared to the overall applications logic. Therefore, favor readability over micro-optimization. Just for info, here some jsperf [big arrays](https://jsperf.com/big-array-concat-spread-push) v.s. [small arrays](https://jsperf.com/small-array-concat-spread-push)


## Array - to Map

```ts
const tickets: Ticket[] = loadTickets();

const ticketsById = new Map(tickets.map((t): [number, Ticket] => [t.id!, t])); 
// infer correct Map<number, Ticket>, because of (t): [number, Ticket] 
```

## Array - to object with Array.reduce

```ts
const names = ['one', 'three'];
const object = names.reduce((obj: any, v) => (obj[v] = true), {}); 
// {one: true, three: true}
```

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

##