_[home](../README.md)_

## Guidelines

### Use `.textContent` to get and set **text** content to HTMLElement

```ts
// get
const txt = el.textContent; // return string | null

// set
el.textContent = 'some text only content';
```

- **DO NOT USE** `.innerText` to get or set text content. It is much slower and even trigger a reflow on get. 

- Use `.innerHTML` **ONLY** when it is necessary to set HTML content, otherwise, use `.textContent` if the element is assumed to have text only.



## DOM Tips & Best Practices

### Get children and destructuring assignment

```ts
// assuming we know the two first are label and the content el. 
const [labelEl, contentEl] = [... el.children] as HTMLElement[];

// Note 1: `[... el.children]` is called spread syntax that will take a iterable object and "spread it" in an array
// Note 2: `const [labelEl, contentEl] = some_array;` is call the destructuring, which declare the variables and assign them in the values
```

### Create fragment and get key children

When creating a DOM fragment, for Web Component content, the most efficient way is to build it via a DocumentFragment with the helper `frag(someHTML)` and then, use the technic below to assign the first level children to some variables or members. 

```ts
// creating document fragment is fast (and does get added to the dom, just temporary memory)
let tmp = frag(`<label></label><div></div><c-ico>chevron-down</c-ico>`);
// destruction assignment to assign directly to object member (could have put in var with const [labelEl, contentEl])
[this.labelEl, this.contentEl] = [... tmp.children] as HTMLElement[];
// adding a document fragment to the dom is the fastest way to add a list of HTMLElement
this.appendChild(tmp);
```

> Note: if you have a `this.inputEl: HTMLInputElement` in the list you have to have any. 

```ts
// creating document fragment is fast
let tmp = frag(`<label></label><input>`);
[this.labelEl, this.inputEl] = [... tmp.children] as any[]; // because heterogeneous assignment (HTMLInputElement)
```