// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/services/web-server/src/express-ext.d.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { UserContext } from 'common/user-context';

declare global {
	namespace Express {
		interface Request {
			context: UserContext
		}
	}
}