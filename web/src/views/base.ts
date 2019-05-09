// This still use the "./lib" module to load the required library, making "./lib" the single point for external libraries.
import { ExtendedDOMEventListener, View } from "mvdom";
import { render } from "ts/render";
import { pathAt, RouteInfo } from "ts/route";


export type RouteInfo = RouteInfo;

//export type EventHandler = (evt?: Event & { selectTarget: HTMLElement }) => void;
export type EventBindings = { [selector: string]: ExtendedDOMEventListener };
export type HubBindings = { [selector: string]: (data?: any, info?: any) => void };

export type BaseViewClass = { new(): BaseView; }

export class BaseView implements View {
	// FIXME: right now to support 2.7.x strictier class properties definition, we initialize the view.id and view.name with empty string
	//        and later, when MVDOM will define them correctly, we will remove this initialization. 

	/** Unique id of the view. Used in namespace binding and such.  */
	id!: number;

	/** The view name or "class name". */
	name!: string;

	/** The htmlElement created "definite assignment assertion" as we know it will be defined after create */
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
		return render(this.name!, this.data);
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

