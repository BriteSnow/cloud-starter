import { BaseHTMLElement } from 'mvdom-xp';
import { pathAt } from 'ts/route';



export class BaseViewElement extends BaseHTMLElement {
	// current path dic
	private currentPaths: { [pathIdx: string]: string } = {};

	/** Returns the path at the index if it has changed from last called. */
	hasNewPathAt(idx: number, defaultPath: string) {

		const path = pathAt(idx) || defaultPath;

		const currentPath = this.currentPaths[idx];
		if (path !== currentPath) {
			this.currentPaths[idx] = path;
			return path;
		} else {
			return null;
		}

	}

	resetNewPathAt(idx: number) {
		delete this.currentPaths[idx];
	}
}