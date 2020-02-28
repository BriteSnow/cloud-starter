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




