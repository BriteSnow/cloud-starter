import { Context } from 'common/context';

declare global {
	namespace Express {
		interface Request {
			context: Context
		}
	}
}