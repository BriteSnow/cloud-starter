// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/services/common/src/perf.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { Context } from './context';
import { Timer } from 'node-simple-timer';

/** This is what will be shared by the PerfContext (user just need the ref to the object) */
class PerfItem {
	readonly name: string;
	time: number | null = null;

	constructor(name: string) {
		this.name = name;
	}
}

/** The full implementation for the PerfItem. */
class PerfItemFull extends PerfItem {

	private timer = new Timer(true);
	private subs: PerfItem[] | null = null;

	constructor(name: string) {
		super(name);
	}

	end() {
		this.time = this.timer.end().milliseconds();
		return this;
	}

	addSub(sub: PerfItem) {
		this.subs = (this.subs) ? this.subs : [];
		this.subs.push(sub);
	}

	toString() {
		return `${this.name}: ${this.time}`;
	}
}

export class PerfContext {
	private rootItems: PerfItemFull[] = [];
	private openItems: PerfItemFull[] = [];

	open(name: string) {
		const p = new PerfItemFull(name);
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

		return p as PerfItem;
	}

	close(p: PerfItem) {
		const pf = (<PerfItemFull>p);
		const last = this.openItems.pop();
		if (last !== p) {
			console.log(`PerfContext ERROR - trying to close openItems, but not match '${(last) ? last.name : 'nothing in openItems list'}' != '${pf.name}'`);
		}
	}

	end(p: PerfItem) {
		(<PerfItemFull>p).end();
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

		descriptor.value = async function monitorWrapper(this: any) {
			const ctx = arguments[0] as Context;
			if (ctx == null || !ctx.constructor.name.startsWith('Context')) {
				throw new Error(`Cannot`)
			}
			const pToken = ctx.perfContext.open(`${this.constructor.name}.${propertyKey}`);

			const r = method.apply(this, arguments);
			ctx.perfContext.close(pToken);
			const obj = this;
			// if the return is a promise, we end on complete
			if (r && typeof (r.then) === 'function') {
				r.then(function () {
					ctx.perfContext.end(pToken);
				}).catch(function () {
					// NOTE: Here we need to have a .catch, otherwise node believes this promise was not caught and log an error
				});

			}
			// otherwise, we close now
			else {
				ctx.perfContext.end(pToken);
			}

			return r;
		}
	}

}
//#endregion ---------- /Decorator ----------