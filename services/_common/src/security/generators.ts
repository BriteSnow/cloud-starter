// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/services/_common/src/security/generators.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import crypto from 'crypto';
import { v4 } from 'uuid';

const SALT_LENGTH = 18;

/** Create a salt (with random buffer of 18), and return the base64 value */
export function createSalt() {
	const buf = crypto.randomBytes(SALT_LENGTH);
	return buf.toString('hex');
}

/** Return a new uuidV4 as string */
export function uuidV4() {
	return v4();
}




