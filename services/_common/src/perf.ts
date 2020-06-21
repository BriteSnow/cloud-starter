// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/services/common/src/perf.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { assertUserContext, UserContext } from './user-context';

/** This is what will be shared by the PerfContext (user just need the ref to the object) */
interface PerfItem {
	name: string;
	startTime?: number;
	endTime?: number;
	duration?: number;
	subs?: PerfItem[];
}

/** The full implementation for the PerfItem. */
class PerfItemImpl implements PerfItem {
	name: string;
	startTime?: number;
	endTime?: number;
	subs?: PerfItem[];

	duration?: number;

	constructor(name: string, duration?: number) {
		this.name = name;

		// if duration, then, the PrefItem is just about duration (already computed, no startTime)
		if (duration != null) {
			this.duration = duration;
		}
		// if not, then, assume the caller will call perfContext.end(handle)
		else {
			this.startTime = Date.now();
		}

	}

	end() {
		if (this.startTime != null) {
			this.endTime = Date.now();
			this.duration = this.endTime - this.startTime;
		}
		// TODO: might need to do a CODE-ERROR log here
		return this;
	}

	addSub(sub: PerfItem) {
		this.subs = this.subs ?? [];
		this.subs.push(sub);
	}

	toString() {
		const dur = this.duration;
		const msg = (dur != null) ? `duration: ${dur}ms` : `start: ${this.startTime}`;
		return `${this.name}: ${msg}`;
	}
}


export class PerfContext {
	private rootItems: PerfItemImpl[] = [];
	private openItems: PerfItemImpl[] = [];

	// Note: Here we put the handle in a weakmap, 
	//       because if nobody has the handle, then, nobody is loking for the item
	//       this is a good use of WeakMap
	// Note: The PerfItemImpl will not be lost since they are in the rootItems tree
	#itemPerHandle = new Map<Symbol, PerfItemImpl>();

	/** 
	 * Return the root items and all of the subItems 
	 * TODO: would need to clone or use immerjs
	 */
	get items() { return this.rootItems }

	/** 
	 * Add a already computed perfItem (only duration, no startTime).
	 * Note: For now, this will be added to the rootItems
	 */
	add(name: string, duration: number) {
		this.rootItems.push(new PerfItemImpl(name, duration));
	}

	/** 
	 * Start a new Perf Timer by name. 
	 * Will be added to rootItems if no current PerfItem in the stack, otehrwise, as .subs 
	 **/
	start(name: string) {
		const p = new PerfItemImpl(name);
		// if there is a pending item, we add it as sub
		const openLength = this.openItems.length
		if (openLength > 0) {
			this.openItems[openLength - 1].addSub(p);
		}
		// otherwise, we add it to the rootItems
		else {
			this.rootItems.push(p);
		}

		// regardless, we add this item to the openItems now.
		this.openItems.push(p);

		const handle = Symbol();
		this.#itemPerHandle.set(handle, p);

		return handle;
	}

	pop(handle: Symbol, fromEnd = false) {
		const pf = this.#itemPerHandle.get(handle);

		// Note: so far we silently ignore if not found. Might want to write-once
		if (pf == null) return;


		const last = this.openItems[this.openItems.length - 1];
		// if the last open item is this one, all normal
		if (last === pf) {
			this.openItems.pop();
		}
		// otherwise, log message if it is not from end. 
		else {
			if (fromEnd) {
				// here we from .end() we assume it if it were close before, it was by intent
			} else {
				// if a pop() is called and the item is not the last, then, probably a mistake, log it
				console.log(`PerfContext ERROR - trying to close openItems, but not match '${(last) ? last.name : 'nothing in openItems list'}' != '${pf.name}'`);
			}
		}
	}

	end(handle: Symbol) {
		const pf = this.#itemPerHandle.get(handle);
		// Note: not found, so, something went wrong. 
		// TODO: Might want to write-once
		if (pf == null) return;

		pf.end();

		// pop it for sure
		this.pop(handle, true);

		// IMPORTANT: Does this after the pop
		this.#itemPerHandle.delete(handle);

	}

	toString() {
		let str = '';
		for (const item of this.rootItems) {
			str += item + '\n';
		}
		return str;
	}
}


//#region    ---------- Decorator ---------- 
export function Monitor() {

	return function (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
		const method = descriptor.value!;

		const fn = async function (this: any) {

			let r: any;

			try {
				const utx = arguments[0] as UserContext;
				assertUserContext(utx);
				const targetName = target.constructor.name;
				const thisName = this.constructor.name;
				const contextName = (targetName === thisName) ? targetName : `(${thisName})${targetName}`;
				const perfHandle = utx.perfContext.start(`${contextName}.${propertyKey}`);
				// const pToken = utx.perfContext.start(`${this.constructor.name}.${propertyKey}`);

				r = method.apply(this, arguments);
				utx.perfContext.pop(perfHandle);
				// if the return is a promise, we end on complete
				if (r && typeof (r.then) === 'function') {
					r.finally(function () {
						utx.perfContext.end(perfHandle);
					}).catch(function () {
						// NOTE: Here we need to have a .catch, otherwise node believes this promise was not caught and log an error
						// NOTE: This does not prevent the start.ts to catch the promise error as well secine we return the promise bellow
					});

				}
				// otherwise, we close now
				else {
					utx.perfContext.end(perfHandle);
				}

				return r;
			} catch (ex) {
				console.log(`Monitor ERROR - ${ex}`);
				// NOTE: for now silent. Return r if available
				// TODO: Probalby need to revise this strategy
				return r;

			}
		}

		// simplify debugging
		Object.defineProperty(fn, "name", { value: `${method.name}_monitorWrapper` });

		descriptor.value = fn;
	}

}
//#endregion ---------- /Decorator ----------