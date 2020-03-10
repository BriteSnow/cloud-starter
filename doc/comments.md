# Comments Best Practices
_[back](README.md)_

The best practice defines three type of comments. 

### Module comment

A module commponent, is a comment for a whole module (e.g., a TypeScript file).
Should be at the top of the file, one empty line above the import, and one empty line below the eventual license comment.

```ts
/////////////////////
// This module provides the authentication web context (KTX) logic
////
```
### One Line Comments

Used to concisely describe few like of code, or a methods or a property. 

- Usually should come after a blank line. 
- Used for small code block (2 to 5 lines)
- or to descrivbe properties, or internal functions.

```ts
// some comment
...code
...code 

// some comment
function someFunction(){..}
```

### Small Section Comments

For small section of codes, we use the four `////` 

```ts

//// Some group of comments/code
// some comment
...code 
...code 

// some comment 
...code 
...code 

//// another group of code
...
```



### Block Section Comments

In a file, class to group methods, or even functions, when a big piece of code needs (m) is about a functionalities. 

- Follow the VSCode folding convention.
- Make sure to follow exactly the same spacing and number of - so that all align correctly and simple to visually parse it. 

```ts
//#region    ---------- Section ---------- 

//#endregion ---------- /Section ---------- 
```