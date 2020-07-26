
# MUST WATCH VIDEO

[Browser Event Loop](https://freek.dev/975-inside-the-browsers-event-loop)

# Web UI Architecture & Patterns
_[back](README.md)_

![](images/ui-component-model.png)

```html
<html>
<head></head>
<body>
<v-main> <!-- MainView creates children below on init() and put <v-project... based on routing -->
  <header><h1>CLOUD-STARTER</h1> <c-user>...</c-user></header>
  <v-nav>...</v-nav>
  <main>
    <v-project> <!-- ProjectView will create its children below on init() -->
      <header>...</header>
      <section>
        <h3>Tasks</h3>
        <t-table>....</t-table>
      </section>
    <v-project>
  </main>
</v-main>
</body>
</html>
```
## DOM Centric Approach

This DOM Centric approach consists of using the DOM as a foundation for a simple, robust, and scalable MVC model.

Here are some of the concepts: 

- Native Web Component (.e.g., mostly custom elements) and HTML Element as the component model (i.e., no virtual dom or high-abstraction frameworks). 
- DOM event model (including custom events) for child-to-parent communication. 
- Web Component properties setter/getters for parent-to-children communications.
- Web Component properties reflected as attributes or css class names for UI state.
- CSS Grid, with Flex box when needed, for layout (e.g., no CSS Layout "framework" needed, CSS Grid is where it is at).
- Follow custom component best practices (see below) for building reusable and performant web components.

> Note: In this documentation, Web Component terminology will refer to custom Elements used in the context of a component model, regardless if they are using or not shadowDOM. Some literature defines Web Component as customElement + shadowDOM + html template (with slots), but from a component model point of view, shadowDOM is just an implementation detail to turn up component opacity, which might or might not be appropriate for given component type (.e.g., Views).

## Component Model

Here is a proposal of a scalable component model using native Web Components.

As show above, this component models split Web Components into **three main categories**. 

- **Component Views** are the main part of the application UI and have the following characteristics: 
  - Usually start with `v-` prefix, 
  - Examples: `<v-main><v-main>` or `<v-nav></v-nav>`
  - Responsibilities: 
    - Manage **routing** of their subviews (form URL path)
    - **CRUD** access to backend data, for example, via the `data client object` patterns (dao for the client)
    - **Set data** to **sub components** (.e.g., get user info from backend, set data to a user badge component).
    - **LISTEN** to sub-component custom events to perform data upate or UI workflow.
    - **Get state and values** from **sub components** (e.g., get data from c-input/c-select/fields component children)

<br />

- **Component Elements** are UI Component reponsible of data visualization and user interaction, and get their data from their view parents via properties or custom `DATA` event call back. 
  - Usually starts with `c-...`  
  - Examples: 
    - `<c-input name="username" value="John></c-input>`, 
    - `<t-table></t-table>` with a property setter `.data: {columns: [...], rows: [...]}`
  - Responsibilities: 
    - **Expose attributes** reflected in component properties for inline or post append initialization.
    - **Render** data to HTML Element or HTML Elements + Custom Elements.
    - Manage **user interaction** for its sub HTML elements and custom elements (as appropriate for performance).
    - **Refresh** content and attributes on properties change. 
    - **parent-to-child communication** 
      - (optional) Expose **state property setters** (e.g., `.active` `.readonly`).
      - (optional) Expose **ONE Data setter property**. Must be fully typed (e.g., `set projects(p: projects[]) {...}`) and MUST NOT be more than one (see Component Communication Scheme section below)
    - **child-to-parents communication**
      - (optional) Expose **state property getters** (e.g., `.active` `.readonly`).
      - (optional) Expose **Custom DOM events** such as `FORM_CHANGED` or `ROW_REORDERED` with a fully typed `event.detail` ()
  - MUST NOTs:
    - MUST NOT contains View Components.
    - MUST NOT access backend data (e.g., no `dco` calls)

<br />

- **HTML Elements** are just raw HTML elements, such as `<header>` `<section>` `<div>` but where custom behavior are not necessary but are still part of the parent component structure for display and user interaction. 
  > Note: It is essential to not over componentize all HTML element, as over componentization is as bad as under componentization. 

<br />

### Component State, Data, and Communication Scheme

As best practice, it is usually more scalable to have components being **stateless** **from a data standpoint**. Meaning, that components can expose a data setters (should no more than one), but won't keep a copy of the data, and therefore won't expose a getter for this property. dom rendering, the component will be the necessary reference information in the elements (`data-id="${project.id}"`) so the custom event trigger can serialize the important data reference information without having to keep a whole copy of the data locally (which then add unnecessary state synchronization complexity to the application model)

The dom-native best practices for component communication use those three schemes:

- **parent-to-child** (and grand children) communication is done via **data property setters** or **UI states property getters and setters** 

- **child-to-parents**  (and grand parents) communication is done via  **custom DOM events** (e.g., `FORM_SUBMIT`)

- **app-to-components** communication, beyond the traditional parent to child or child to parents, used the dom-native pub/sub library, via the HUB API. For example, if a View or even Component element wants to listen to a data change, it can by having method such as:

```ts
@onHub('dcoHub','Project', 'create, update')
projectChange(data: ...) { ...}
```

### Base HTML Class (dom-native and @dom-native/ui)

In this application frontends, we will be using [dom-native](https://github.com/dom-native/dom-native) which is a micro library enabling for native Web Component development. 

- The base class of all components (component elements and views) will be [dom-native](https://github.com/dom-native/dom-native) `BaseHTMLElement`
  - Sub Classes implement `init()` to create the innerHTML or appendChild, to set states, and to bind events. It is garanteed to be called only once. 
  - Always called `super.init()` at the beginning of the `init()` SubClass implementation. 
  - Not need to worry about `connectedCallback()` (if called, make sure to call `super.connectedCallback()`)
- We will use the [dom-native](https://github.com/dom-native/dom-native) `InputElement`, ... for basic input field components, and extends from `BaseFieldElement` for our custom element. 
  - `BaseFieldElement` normalize the `.value` pattern and disabled, readonly css/property behavior, and should be used for any custom element. 
  - dom-native also provide a set of base input element such as `InputElement <m-input/>` `SelectElement <m-select/>` that should be used and can be simply styled. 
- Views will extends an application base case `BaseViewElement` with some addtional utilities for view lifecycles. 


#### Anatomy of a Simple Web Component

> Note: Comments starting with `//>` are notes and destitned to be removed from normal code. Other comments are best practices lines. 

```ts
@customElement('v-my') // use the ts decorator to define the element, just on top of the class definition
class MyView extends BaseHTMLElement{

  //// Key Elements
  get headerEl() { return first(this, 'header')!}
  get contentEl() { return first(this, 'content')!}

  //// Data Setters
  set title(v: string) { this.headerEl.textContent = v}
  set content(v: string) { this.contentEl.textContent = v}

  //// State Getters/Setters
  get highlighted() { return this.classList.contains('highlighted')}
  set highlighted(v: boolean) { css(this, {highlighted: v})}

  //#region    ---------- Element Events ---------- 
  @onEvent('click', 'header')
  headerClicked(evt: MouseEvent & OnEvent){
    console.log('header was clicked', evt.selectTarget);
  }
  //#endregion ---------- /Element Events ---------- 

  //#region    ---------- Doc/Win Events ---------- 
  //...
  //#endregion ---------- /Doc/Win Events ---------- 

  //#region    ---------- Hub Events ---------- 
  @onHub('dcoHub', 'Project', 'create')
  projectCreated(data: Project, info: {topic: string, label: string}){
    console.log(data, info.topic, info.label); 
  }
  //#endregion ---------- /Hub Events ---------- 

  //#region    ---------- Lifecycle ---------- 
  init(){ 
    super.init(); // here by convention, call super.init()
    this.innerHTML = _render(); 
  }

  preDisplay(){
  }
  //#endregion ---------- /Lifecycle ---------- 
  
  refresh(){
  }
}

//// HTML
_render(){
  return `<header></header>
  <section> 
  </section>
  `
}
```

- `@customElement('v-my')` use the ts decorator to define the element, just on top of the class definition
- `//// Key Elements` Here we defined the key children elements getters from this web components. They are read only, and use document query. for resiliency (this way, if the HTML change, still work).
  - e.g., `get headerEl() { return first(this, 'header')!}`
    - Here we can make `!` as we know that after init() it they will always exists.
    - By convention, all elements property getters should end with `El` 
- `//// Data Setters` Now we define the "data setters" of the component, in this components, we willl have two, but usually one is the prefered way
  - e.g., `set title(v: string) { this.headerEl.textContent = v}`
    -  Note that here we do NOT keep the data, which is the best practice if we do not need to return it. 
    - Same pattern here. Obviously, we could have taken some HTML or element. 
    - It's usually a good practice to avoid to have multiple data getters, but some component might have one data getter, 
    - such as the BaseFieldElement, which has .value, and also .name (which is more a read only and a reflection of the name attribute)
- `//// State Getters/Setters` Here we put the component state getters/setters, that usually reflect their states in the corresponding component css class names or attribute (see BaseFieldElement)
  - e.g., 
    - `get highlighted() { return this.classList.contains('highlighted')}`
    - `set highlighted(v: boolean) { css(this, {highlighted: v})} `
  - Here just use the css(el, obj) convenient css setter for v is a boolean and set or remove the key as class name
- `//#region    ---------- Element Events ---------- ` In this section put all of the @onEvent bindings, which is event bound to the `this` element.
  - `@onEvent('click', 'header')`
- `//#region    ---------- Doc/Win Events ---------- `
  - Put here any events bound with `@onDoc` and `@onWin`. Try to avoid those as much as possible, but sometime, we have to have those to trap keyboards that are not linked to an input element.
-  `//#region    ---------- Hub Events ---------- ` Put hub events
 

```ts
...
  //#region    ---------- Lifecycle ---------- 
  //> `init()`will be called ONCE just after the constructor (in the connectedCallback lifecycle)
  //> Create the HTML structure or content of the html element, can use `this.innerHTML` or `this.appendChild(fragment)`
  //> It's a good pratice to always create at least the bare HTML structure of the component in init() so that we can have 
  //> always existing key elements getter
  init(){ 
    super.init(); // here by convention, call super.init()
    this.innerHTML = _render(); 
  }

  //> This method, if defined, will be called just before the first paint, but after the code after the instantiation is called. 
  //> This is usefull for components that expect the JS to set some more data that should be combined to do a full rendering. 
  //> IMPORTANT: as with init, any async calls (promise, callback, await) will be called after the first paint. 
  preDisplay(){
  }

  //> postDisplay() is also available, and will be called on the next frame, but not really used in most of the component. 
  //#endregion ---------- /Lifecycle ---------- 
  
  //> This is NOT a BaseHTMLElement lifecyle, but a good pratice, and should have the logic to re-render or just update
  //> content on property or event change
  refresh(){
  }
}

//// HTML

//> here start with `_` because not the global render(), but just a string rendering.
//> Since it is using just JS templating, those function can get some parameters as well. 
//> The recommendation is to have the parameters optional, so that in any case, the base HTML can be rendered even if data not present. 
//> And then, it can 
_render(){
  return `<header></header>
  <section> 
  </section>
  `
}
```

#### Parent to Child communication.

The best practice is the following: 

- On the child side, ass a 
Done via properties on the child (could be only the setter. For Example

With the component 

```ts

type MyComponentOptions = {...}
class MyComponent extends HTMLElement{

  set options( opts: MyComponentOptions) => {
    // do something with opts. 
    // do not store on this... if it is not really necessary.
  }
}
customElements.define('my-component', MyComponent)
```

```ts

const myComponentEl = document.createElement('my-component');
// Here the element is correctly created, but MyComponent class not instantiated yet. 

myComponentEl.options = ...; // <-- NOT FAIL but NOT RIGHT. It will set to the htmlElement object, which does not have teh setter defined. 

const myComponentObj = document.body.appendChild(myComponentEl);
// At this point, myComponentObj has been instantiated, and 
// connectedCallback() has been called (and therefore init() for BaseHTMLElement)

myComponentObj.options = ...; // <-- Correct assignment to the MyComponent object.

```


### Code Structure

All Web UI applications source code is structured the following way: 

- **services/web-server/web-folder** For each web application, we have a corresponding service (backend) web server with a _web-folder/_ which will be the output directory for the _js_ and _css_ files, as well as root _index.html_ files. 

- **frontends/web/** The _web_ client source code (.ts, .pcss, .tmpl) is located in the _frontends/_ folder structxure with the name of the web app (note: first one being often just 'web', hend the _frontends/web/_)

- UI code used **TypeScript (.ts)** for all logic code, **PostCSS (.pcss)** for all styling code, **Handlebars (.tmpl)** for most templating code beside inline templating for Custom Elements. TypeScript files will be processed by [Rollup](https://github.com/rollup/rollup) with the typing

- UI Code structure, below the **frontends/web/**, follows the following code layout:

  - **`src/_pcss/*.pcss`** Those are the base css files from mixins, CSS Vars, to base styling for the web applications. The folder is prefixed by `_` so that it ran first by the postCSS processor without extra configuration.

  - **`src/ts/*.ts`** All of the main/base TypeScript files for the application level logic and cross view utilities (e.g., `main.ts` to start the app, `ajax.ts` for ajax wrapper, etc...)

  - **`src/views/**/*.[ts/pcss/tmpl]`** All of the views asset, typsically starting by `v-view-name.ts` and . 
    - ALL file name are LOWERCASE, and split with `-` character, typcially starting with `v-` such as `v-view-name.ts`.
    - Typically a matching name file for postCss is created such as `v-view-name.pcss`
    - When templates for the component is relatively big, we can can put it in another file `v-view-name.tmpl` which will be accessbile as handlebars template (accessible with `render('v-view-name', data)`. 


See [frontends/web/src/web-components c-input example](../frontends/web/src/web-components/c-input.ts)


## See Also


See [Web Components Spec Summary](web-components.md)