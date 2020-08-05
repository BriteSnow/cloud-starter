import { AllEventDic } from 'shared/event-types';
import { typecheck } from '../utils';



export function assertEvent<N extends keyof AllEventDic>(event: N, val: any): asserts val is AllEventDic[N] {
	// basic check for now 
	// FIXME: Needs to do correct check
	typecheck(val, { nums: ['mediaId', 'wksId'] });
	if (val.type !== event) throw new Error(`event ${val} is not of type ${event} `);
}
