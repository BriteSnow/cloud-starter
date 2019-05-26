// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/services/web-server/src/express-utils.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { Context } from 'common/context';

declare global {
	namespace Express {
		interface Request {
			context: Context
		}
	}
}