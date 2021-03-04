_[home](../README.md)_

# Web Components

This is a summary of the internal of the browser base HTMLElement lifecycle and apis. 

With the deprecation of IE11 and Edge move to Google Chrome, Native **WebComponents**, without heavy frameworks (e.g., Angular, React), are now a reality, and can be added to rich **DOM Centric** application development.


- **Custom Elements** have simple and very robust browser support to efficiently componentized the application custom elements.

- **shadowDom** (not yet) unfortunately _shadowDOM_ styling opacity model adds quite a bit of complexity to application styling, especially for those that want to use great tooling like postCSS. For now, we will start developing the component without _shadowDOM_ first, but we will be following the best practices so that we can adopt it once we have integrated postCSS into our dev cycle (probably with .cpcss, which will be component css put in the templates.js and can be retrieved by appTemplates.css.templateName).

- **Templates** This is another thing that can be useful, although HTML Templates are not as expressive as handlebars. For now, we will either use inline **string literals** or use the handlebars. Also, Web Components are for atomic components and will be mostly ts/CSS, as the templating needs are more on the view.  


For application, do NOT use raw custom elements, but implement at least the BaseHTMLElement with `init()`, but it is important to understand how the HTMLElement works

This is just to explain the underlying behaviors. 

```ts
class MyElement extends HTMLElement{
  // only needed if attributeChangedCallback is used
  static get observedAttributes() {
    return ['disabled', 'open'];
  }

  constructor(){
    super(); // first line, always super();

    // bind events to this. 
    // attach/create shadowDOM if shadowDOM component. 
    // see construtor rules below
  }

  // Called when element is connected to DOM. 
  connectedCallback(){
    super.connectedCallback(); // best pratice
    // create innerHTML if needed but only on first call (can be called multiple time)
  }

  // Called every time the element is removed from the DOM. 
  disconnectedCallback(){}

  // Called when an observed attribute has been added, removed, updated, or replaced
  attributeChangedCallback(attrName, oldVal, newVal){}

  // Called when the custom element has been moved into a new document
  adoptedCallback(){}


}
```

HTMLElement Methods: (see [google doc](https://developers.google.com/web/fundamentals/web-components/customelements), [mozilla doc](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements)) 

- `constructor() `rules (see [spec](https://html.spec.whatwg.org/multipage/custom-elements.html#custom-element-conformance))
  - A parameter-less call to super() must be the first statement in the constructor body, to establish the correct prototype chain and this value before any further code is run.
  - A return statement must not appear anywhere inside the constructor body, unless it is a simple early-return (return or return this).
  - The constructor must not use the document.write() or document.open() methods.
  - The element's attributes and children must not be inspected, as in the non-upgrade case none will be present, and relying on upgrades makes the element less usable.
  - The element must not gain any attributes or children, as this violates the expectations of consumers who use the createElement or createElementNS methods.
  - In general, work should be deferred to connectedCallback as much as possible—especially work involving fetching resources or rendering. However, note that connectedCallback can be called more than once, so any initialization work that is truly one-time will need a guard to prevent it from running twice.
  - In general, the constructor should be used to set up initial state and default values, and to set up event listeners and possibly a shadow root.
- `connectedCallback()` Called every time the element is inserted into the DOM. Useful for running setup code, such as fetching resources or rendering. Generally, you should try to delay work until this time.
  - Note 1: connectedCallback may be called once your element is no longer connected, use `Node.isConnected` to make sure.
  - Note 2: This will happen each time the node is moved, and may happen before the element's contents have been fully parsed. 
  - Note 3: Since Note 2, if appendChild or innerHTML needs to make sure it is only the first call. 
  - Note 4: Not called in when added/removed from document fragment, and this HTML Template are in documentFragment, won't be called when added in HTML template as well. 
- `disconnectedCallback()` Called every time the element is removed from the DOM. Useful for running clean up code.
  - Note 1: Not called in when added/removed from document fragment.
- `attributeChangedCallback(attrName, oldVal, newVal)` Called when an observed attribute has been added, removed, updated, or replaced. Also called for initial values when an element is created by the parser, or upgraded. 
  - Note 1: only attributes listed in the observedAttributes property will receive this callback.
  - Note 2: can be called before or after the above callbacks depending on how your custom element is used. 
- `adoptedCallback()` The custom element has been moved into a new document (e.g. someone called document.adoptNode(el)).
- CSS Pre-styling unregistered elements, `app-drawer:not(:defined)` see [prestyle](https://developers.google.com/web/fundamentals/web-components/customelements#prestyle)

#### HTML Template & Document Fragments & Custom Elements

Not to be used yet, just as a reference. 

HTML Template hold a HTML DOM for later to be cloned. It is not displayed or rendered, so, it has no layout cost (just html parsing, and custom element expension when added as children).

Run in console in the http://localhost:8080/_spec/controls page

```js
import { first } from 'dom-native';

let t1 = document.createElement('template');

// innerHTML, which is the same as if the <template> element is in the page, create the #document-fragment
t1.innerHTML = '<c-input label="fieldZ" value="zzz"></c-input>';
// t1.content is a #document-fragment
// connectedCallback won't be called because document fragment. 

// if we add this template to document body, the components constructor and connectedCallback will NOT get called, because they are in a document-fragment.

// if we add this template to body, and do a t1.appendChild(t1.content);, document fragements element 
// will be moved to regular template children and components constructor and connectedCallback WILL get called.


// If we clone the document fragment (.content) in the DOM, then constructor and connectedCallback WILL get called.
first('.spec-form > section').appendChild(t1.content.cloneNode(true));
```