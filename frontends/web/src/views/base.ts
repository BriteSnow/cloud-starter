// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/frontends/web/src/views/base.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { ExtendedDOMEventListener, View } from "mvdom";
import { render } from "ts/render";
import { pathAt, RouteInfo } from "ts/route";

/// This module define the BaseView mvdom View implementation that should be used for all Application Views. 
/// It also define couple of helper types, functions, and routing base logic. 

export type RouteInfo = RouteInfo;

//export type EventHandler = (evt?: Event & { selectTarget: HTMLElement }) => void;
export type EventBindings = { [selector: string]: ExtendedDOMEventListener };
export type HubBindings = { [selector: string]: (data?: any, info?: any) => void };

export type BaseViewClass = { new(): BaseView; }

export class BaseView implements View {

	/** 
	 * Unique id of the view. Used in namespace binding and such. 
	 * This is set by mvdom.display, before create.
	 **/
	id!: number;

	/** 
	 * The view name or "class name". 
	 * This is set by mvdom.display, before create.
	 **/
	name!: string;

	/** 
	 * The htmlElement created "definite assignment assertion" as we know it will be defined after create.
	 * This is set by mvdom.display, after the create.
	 */
	el!: HTMLElement; // 

	data?: any; // optional data to be used while create

	// Here we use the object type, as we do not want to have two same bindings for the same event in the same class hierarchy
	events: EventBindings = {};

	docEvents: EventBindings = {};

	winEvents: EventBindings = {};

	closestEvents: EventBindings = {};

	// Here we use the array way, because, we want to allow subclass to also listen to the same hubEvents 
	//   as the base class (might be useful in some circumstances)
	hubEvents: HubBindings[] = [];



	create(): DocumentFragment | HTMLElement {
		const fragment = render(this.name!, this.data);
		// NOTE: fragment might have a comment, so, we take the firstElement, which is the MVDOM View best pratice.
		return fragment.firstElementChild! as HTMLElement;
	}

	// current path
	private currentPaths: { [pathIdx: string]: string } = {};

	/** Returns the path at the index if it has changed from last called. */
	hasNewPathAt(idx: number, defaultPath: string) {

		const path = pathAt(idx) || defaultPath;

		const currentPath = this.currentPaths[idx];
		if (path !== currentPath) {
			this.currentPaths[idx] = path;
			return path;
		} else {
			return null;
		}

	}

	resetNewPathAt(idx: number) {
		delete this.currentPaths[idx];
	}
}



export function addDomEvents(target: EventBindings, source: EventBindings) {
	return Object.assign(target, source);
}

export function addHubEvents(target: HubBindings[], source: HubBindings) {
	target.push(source);
	return target;
}


// export function assign<T>(target: T, source: T): T {
// 	return Object.assign(target, source);
// }

// export function add<T>(target: T[], source: T): T[] {
// 	target.push(source);
// 	return target;
// }

