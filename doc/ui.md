
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
### DOM Centric Approach

This DOM Centric approach consists of using the DOM as a foundation for a simple, robust, and scalable MVC model.
Here are some of the guidelines: 

- Using native Web Component, custom elements, and HTML Element as the component model (i.e., no virtual dom or high-abstraction frameworks). 
- Using the DOM event model for child to parent state communication, and Web Component properties setter/getters for parent to component children communications.
- Reflect custom component properties to css and attributes for simple and flexible css styling.
- Master CSS Grid for layout. (e.g., no CSS Layout "framework" needed, CSS Grid is where it is at).
- Follow custom component best practices (see below) for building reusable and performant web components.

From a best practice perspective, we can split the Components into the following different categories:

  - **Component Views** are custom elements, usually with the `<v-...` tag prefix, that encapsulates most of the business logic of a part of the UI system. Their responsibilities are as follow: 
    - Manage Routing of its direct subviews.
    - There are the ONLY component types that should be able to get/set backend data (via DCOs)
    - get/set data to their Component Elements.
    - LISTEN to the Component Element events to update backend data and subviews. 
    - Examples: 
      - `MainView` The very top view of the application usually managing routing and other app-wide event/behavior, and initialize the nav view, and the header and top right user display information. 
      - `NavView` Is responsible of displaying and iter
    > Note: The current cloud-starter code still use the `mvdom` **views** for those components, but `mvdom` direction is to fully embrace Web Component (e.g., customElements) as the component model, using the `mvdom-xp` BaseHTMLElement base class (which will eventually get merged into `mvdom`). 

  - **Component Elements** (e.g. `<c-input name='fieldA'></c-input>`are UI component that can be used in view or composed with other component elements. Their responsibilities are as follow: 
    - Exposed clear and typescript typed external interface (typically via properties setter/getter) to parent element to set and get component data. 
    - Trigger custom events based user Interaction for parent components (not necessarely direct parent) to react. 
    - MUST NOT access any backend data (.e.g., no call to DCOs), and rather expect the data to be set by a view, or call a `DATA` event with a `.detail{ sendData: (data) => void}` to request data. 
    - Data format should be from the component purpose and not backend data specific.

  - **HTML Elements** are just raw html elements, such as `<header>` `<section>` `<a>` ... but where custom behavior are not necessary but are still part of the parent component structure for display and user interaction. 
    > Note: It is important to not over componentize all HTML element, as over componentization is as bad as under componentization. 


### Code Structure

All Web UI applications source code is structure the following way: 

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


- **Custom Elements** is a simple and very robust browser support to efficiently componentized the application custom elements. A good 

- **shadowDom** (not yet) unfortunately _shadowDOM_ styling opacity model adds quite a bit of complexity to application styling, especially for those that want to use great tooling like postCSS. For now, we will start developing the component without _shadowDOM_ first, but we will be following the best practices so that we can adopt it once we have integrated postCSS into our dev cycle (probably with .cpcss, which will be component css put in the templates.js and can be retrieved by appTemplates.css.templateName).

- **Templates** This is another thing that can be useful, although, HTML Templates are not as expressive as handlebars. For now, we will either use inline **string literals** or use the handlebars. Also, Web Components are for atomic components and will be mostly ts/css, as the templating needs are more on the view.  



See [frontends/web/src/web-components c-input example](../frontends/web/src/web-components/c-input.ts)


#### Best practices

For the application development, all custom components will extend at least `BaseHTMLElement` which provided normalized methods and properties (coming soon) to express the component behavior without re-implementing underlying custom elements lifecycle and its intricacies. 

- `mvdom-xp` contains the base class that custom component should inherit from.

  - `BaseHTMLElement` provide a basic class for all Sub Classes to inherit from. 
    - Sub Classes implement `init()` to create the innerHTML or appendChild, to set states, and to bind events. It is garanteed to be called only once. 
    - Always called `super.init()` at the beginning of the `init()` SubClass implementation. 
    - Not need to worry about `connectedCallback()` (if called, make sure to call `super.connectedCallback()`)

  - `BaseFieldElement` inherit _BaseHTMLElement_ and provide the basic logic for **field based** Custom Component that have name / value, such as input, checkbox, options, ...
    - Sub Classes needs to manage their `.value` state, and call `this.triggerChange()`, implemented by _BaseFieldElement_, to trigger the DOM `CHANGE` event on the component with `{detail:{name,value}}`. Do not trigger this event manually as _BaseFieldElement_ has some guard for it, just call `this.triggerChange()`.
    - `BaseFieldElement.init` will add the needed `mvdom dx` css class and pusher/puller if the component tag as `.name` and event a generic pusher/puller for all field based custom components. See [SpecControlsView](../frontends/web/src/views/Spec/SpecViews.ts)


_more best practices coming soon_

See [Web Components Spec Summary](web-components)