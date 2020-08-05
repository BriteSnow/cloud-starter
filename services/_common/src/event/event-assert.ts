import { typecheck } from '../utils';
import { EventDic } from './event-types';



export function assertEvent<N extends keyof EventDic>(event: N, val: any): asserts val is EventDic[N] {
	// basic check for now 
	// FIXME: Needs to do correct check
	typecheck(val, { nums: ['mediaId', 'wksId'] });
	if (val.type !== event) throw new Error(`event ${val} is not of type ${event} `);
}
