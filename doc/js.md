

## JavaScript Danger Zone

Things to be aware about javascript hidden danger. 

### Number Parsing
```js
// Number() parsing
v = Number('123'); // OK. === 123 (litteral 123)
v = Number(''); // DANGER. === 0;

// GUIDELINE, use mvdom-xp 'asNum('')' or other lib (parseInt work as expected, but only int)
v = asNum('');; // null
```

### Array Number Sorting

```js
a = [2, 1,3];
a.sort(); // OK. [1, 2, 3]

b = [-5, -3];
b.sort(); // DANGER. [-3, -5] (string ordering)

// GUIDELINE: When sorting number ALWAYS have comparator. 
b.sort((a, b) => a - b);
```