export function now() {
	var hrTime = process.hrtime();
	return hrTime[0] * 1000 + hrTime[1] / 1000000;
}

// --------- CallReducer --------- //
type Fn = (item: any) => any;

/**
 * Allow to reduce the number of function call by grouping them per gracePeriod.
 * Each call to `map(item)` start/postpone the gracePeriod on which the `fn` will be called with the array of items.
 * 
 */
export class CallReducer {
	private lastChange: number | null = null;

	private fn: Fn;
	private gracePeriod: number;
	private items: string[] = [];
	private result: any | undefined;

	constructor(fn: Fn, gracePeriod: number) {
		this.fn = fn;
		this.gracePeriod = gracePeriod;
	}

	map(item?: string) {
		// add the data to the items list
		if (item !== undefined) {
			this.items.push(item);
		}
		// if we do not not have a lastChange, this mean this is the first for this cycle
		// and we start the scheduler
		if (this.lastChange == null) {
			this.lastChange = now();
			this.scheduleCall();
		}
		// otherwise, we just update the lastChange
		else {
			this.lastChange = now();
		}
	}

	private scheduleCall() {
		// this shoul dnot happen
		if (this.lastChange == null) {
			console.log(`ERROR - should not do the ${this.lastChange}`);
			return;
		}
		// if the gracePeriod from last changed is past, we do the update
		if (this.lastChange + this.gracePeriod < now()) {
			const items = this.items;
			this.items = [];
			this.lastChange = null;
			this.result = this.fn.call(null, items);
		} else {
			setTimeout(() => { this.scheduleCall() }, 100);
		}
	}
}
// --------- /CallReducer --------- //

export async function prompt(message: string): Promise<string> {
	// console.log(`\n${message}: `);
	process.stdout.write(`${message}`);
	return new Promise(function (resolve, reject) {
		process.stdin.resume();
		process.stdin.setEncoding('utf8');
		process.stdin.on('data', function (text: Buffer) {
			process.stdin.pause();
			resolve(text.toString().trim());
		});
	});
}