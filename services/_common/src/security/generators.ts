import crypto from 'crypto';
import _uuidv4 from 'uuid/v4';

const SALT_LENGTH = 18;

/** Create a salt (with random buffer of 18), and return the base64 value */
export function createSalt() {
	const buf = crypto.randomBytes(SALT_LENGTH);
	return buf.toString('hex');
}

/** Return a new uuidV4 as string */
export function uuidV4() {
	return _uuidv4();
}




