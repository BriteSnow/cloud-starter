/**
 * This is where the 3rd party get imported and put in the global scope. 
 * 
 * This will be processed individually by Rollup to `web/js/lib-bundle.js`
 * 
 * Keep it .js to make it simple (no need to have type checking on this file)
 * 
 */

// Just need the handlebars/runtime
import Handlebars from "handlebars/runtime";
window.Handlebars = Handlebars;


// make sure the Handlebar.templates exists (will be used by templates.js as template store)
Handlebars.templates = Handlebars.template || {};
// Make all templates partials (no reason why they should not)
Handlebars.partials = Handlebars.templates;

// Note: At some point, we might want to three shake this one, and have it local to app-bundle
// import * as d3 from "d3";
// window.d3 = d3;

// import * as Gtx from "gtx";
// window.Gtx = Gtx;