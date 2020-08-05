import { StreamEntry } from 'redstream/dist/redstream';
import { getQueue, JobEventDic, Queue } from './queue';


class JobBase<N extends keyof JobEventDic>{
	#queue: Queue<N>;
	#name: N;
	#group: string;

	constructor(eventName: N) {
		this.#name = eventName;
		this.#queue = getQueue(eventName);
		this.#group = this.#name + `-JGRP`;
	}

	async next(): Promise<StreamEntry<JobEventDic[N]>> {
		return this.#queue.next(this.#group);
	}


	async progress(prog: { [step_name: string]: number }) {
		// TODO 
	}

	async done(entry: StreamEntry<JobEventDic[N]>) {
		await this.#queue.ack(this.#group, entry.id);
		// TODO: add to the todoStream
	}

	async fail(entry: StreamEntry<JobEventDic[N]>, error: Error) {
		// TODO
	}


}


export const vidInitJobbManager = new JobBase('JobVidInitTodo');
export const vidScalerJobbManager = new JobBase('JobVidScalerTodo');