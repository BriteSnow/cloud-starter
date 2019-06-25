
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
Here are some of the guidelines: 

- Using native Web Component, custom elements, and HTML Element as the component model (i.e., no virtual dom or high-abstraction frameworks). 
- Using the DOM event model for child-to-parent state communication, and Web Component properties setter/getters for parent-to-children communications.
- Reflect custom component properties to CSS and attributes for simple and flexible css styling.
- Master CSS Grid for layout. (e.g., no CSS Layout "framework" needed, CSS Grid is where it is at).
- Follow custom component best practices (see below) for building reusable and performant web components.

> Note: In this documentation, Web Component terminology will refer to custom Elements used in the context of a component model, regardless if they are using or not shadowDOM. Some literature defines Web Component as customElement + shadowDOM + template, but from a component model point of view, shadowDOM is just an implementation detail to turn up component opacity, which might or might not be appropriate for given component type (.e.g., Views).

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

The MVDOM best practices for component communication use those three schemes:

- **parent-to-child** (and grand children) communication is done via **data property setters** or **UI states property getters and setters** 

- **child-to-parents**  (and grand parents) communication is done via  **custom DOM events** (e.g., `FORM_SUBMIT`)

- **app-to-components** communication, beyond the traditional parent to child or child to parents, used the MVDOM pub/sub library, via the HUB API. For example, if a View or even Component element wants to listen to a data change, it can by having method such as: 
```ts
@onHub('dcoHub','Project', 'create, update')
projectChange(data: ...) { ...}
```


## Code Structure

All Web UI applications source code is structured the following way: 

- **services/web-server/web-folder** For each web application, we have a corresponding service (backend) web server with a _web-folder/_ which will be the output directory for the _js_ and _css_ files, as well as root _index.html_ files. 

- **frontends/web/** The _web_ client source code (.ts, .pcss, .tmpl) is located in the _frontends/_ folder structxure with the name of the web app (note: first one being often just 'web', hend the _frontends/web/_)

- UI code used **TypeScript (.ts)** for all logic code, **PostCSS (.pcss)** for all styling code, **Handlebars (.tmpl)** for most templating code beside inline templating for Custom Elements. TypeScript files will be processed by [Rollup](https://github.com/rollup/rollup) with the typing

- UI Code structure, below the **frontends/web/**, follows the following code layout:

  - **`src/_pcss/*.pcss`** Those are the base css files from mixins, CSS Vars, to base styling for the web applications. The folder is prefixed by `_` so that it ran first by the postCSS processor without extra configuration.

  - **`src/ts/*.ts`** All of the main/base TypeScript files for the application level logic and cross view utilities (e.g., `main.ts` to start the app, `ajax.ts` for ajax wrapper, etc...)

  - **`src/views/**/*.[ts/pcss/tmpl]`** All of the views asset. By convention, each views have a `ViewName.ts` (logic/controller, always start with a `div.ViewName`), `ViewName.pcss` (style, scoped from `.ViewName`), and `ViewName.tmpl` (handlebars templates, prefixed with `ViewName-...` when multiple templates fror same view needed). 
    - Most views are organized in one level directory structure based on their names. 
    - View are names from generic-to-specific taxonomy to make the prefix match the folders and to be able to navigate code more effective. For example, `ProjectAddDialog.*` will be used over _AddProjectDialog.*_, which will usually be under a `src/views/Project/` folder.

  - **`src/web-components/*.[ts/pcss]`** All of the CustomElements/WebComponent (minus _shadowDOM_)



### Web Components

With the deprecation of IE11 and Edge move to Google Chrome, Native **WebComponents**, without heavy frameworks (e.g., Angular, React), are now a reality, and can be added to rich **DOM Centric** application development.


- **Custom Elements** have simple and very robust browser support to efficiently componentized the application custom elements.

- **shadowDom** (not yet) unfortunately _shadowDOM_ styling opacity model adds quite a bit of complexity to application styling, especially for those that want to use great tooling like postCSS. For now, we will start developing the component without _shadowDOM_ first, but we will be following the best practices so that we can adopt it once we have integrated postCSS into our dev cycle (probably with .cpcss, which will be component css put in the templates.js and can be retrieved by appTemplates.css.templateName).

- **Templates** This is another thing that can be useful, although HTML Templates are not as expressive as handlebars. For now, we will either use inline **string literals** or use the handlebars. Also, Web Components are for atomic components and will be mostly ts/CSS, as the templating needs are more on the view.  



See [frontends/web/src/web-components c-input example](../frontends/web/src/web-components/c-input.ts)


#### Best practices

For the application development, all custom components will extend at least `BaseHTMLElement` which provided normalized methods and properties (coming soon) to express the component behavior without re-implementing underlying custom elements lifecycle and its intricacies. 

- `mvdom-xp` contains the base class that custom component should inherit from.

  - `BaseHTMLElement` provides a basic class for all Sub Classes to inherit from. 
    - Sub Classes implement `init()` to create the innerHTML or appendChild, to set states, and to bind events. It is garanteed to be called only once. 
    - Always called `super.init()` at the beginning of the `init()` SubClass implementation. 
    - Not need to worry about `connectedCallback()` (if called, make sure to call `super.connectedCallback()`)

  - `BaseFieldElement` inherit _BaseHTMLElement_ and provide the basic logic for **field based** Custom Component that have name / value, such as input, checkbox, options, ...
    - Sub Classes needs to manage their `.value` state, and call `this.triggerChange()`, implemented by _BaseFieldElement_, to trigger the DOM `CHANGE` event on the component with `{detail:{name,value}}`. Do not trigger this event manually as _BaseFieldElement_ has some guard for it, just call `this.triggerChange()`.
    - `BaseFieldElement.init` will add the needed `mvdom dx` css class and pusher/puller if the component tag as `.name` and event a generic pusher/puller for all field based custom components. See [SpecControlsView](../frontends/web/src/views/Spec/SpecViews.ts)



_more best practices coming soon_

See [Web Components Spec Summary](web-components.md)