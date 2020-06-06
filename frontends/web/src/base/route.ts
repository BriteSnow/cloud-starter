// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/frontends/web/src/ts/route.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { hub, on } from 'dom-native';
import { asNum } from 'utils-min';

// Global routeHub to trigger the events
const routeHub = hub("routeHub");

let _routeInfo: RouteInfo | null = null;

export function initRoute() {
	triggerRouteChange();
}

export function pathAt(idx: number): string | null {
	return getRouteInfo().pathAt(idx);
}

export function paths(): string[] {
	return getRouteInfo().paths().slice(); // prevent usage to mutate orginal
}

export function pathAsNum(idx: number): number | null {
	return getRouteInfo().pathAsNum(idx);
}

export function param(name: string): string | null {
	return getRouteInfo().param(name);
}

export function pushPath(path: string) {
	history.pushState('', document.title, path);
	_routeInfo = null; // reset routeInfo
	triggerRouteChange();
}


interface Params {
	get(name: string): string | null;
}

interface RouteInfoData {
	paths: string[];
	hash: string;
	params: Params;
}
export class RouteInfo {
	private _data: RouteInfoData;

	constructor(data: RouteInfoData) {
		this._data = data;
	}

	pathAt(idx: number): string | null {
		return (this._data.paths.length > idx) ? this._data.paths[idx] : null;
	};

	pathAsNum(idx: number): number | null {
		let num = this.pathAt(idx);
		return asNum(num);
	};

	paths(): string[] {
		return this._data.paths;
	}

	hash(): string {
		return this._data.hash;
	}

	param(name: string): string | null {
		return this._data.params.get(name);
	}
}

document.addEventListener('DOMContentLoaded', function (event) {
	on(document, 'click', 'a', function (evt) {
		const a = evt.selectTarget;
		const href = a.getAttribute('href');

		if (href) {

			// If full url or marked reload-link, then, let the borwser do it's job.
			if (href.startsWith('http') || a.classList.contains('reload-link')) {
				return;
			}

			//// Otherwise, we handle the state change

			// otherwise, we make sure a does not reload the page
			evt.preventDefault();

			// change URL
			pushPath(href);
		}


	});

	on(window, 'popstate', function () {
		_routeInfo = null; // reset routeInfo
		triggerRouteChange();
	});

	on(window, 'hashchange', function () {
		_routeInfo = null; // reset routeInfo
		triggerRouteChange();
	});
});

// --------- utilities --------- //
function triggerRouteChange() {
	routeHub.pub('CHANGE', '');
}

function getRouteInfo() {
	if (!_routeInfo) {
		_routeInfo = buildRouteInfo();
	}
	return _routeInfo;
}

function buildRouteInfo(): RouteInfo {
	let hash = window.location.hash;
	let pathname = window.location.pathname;
	if (pathname.endsWith('/')) {
		pathname = pathname.substring(0, pathname.length - 1);
	}
	const paths = pathname.split('/').slice(1);
	const url = new URL(window.location.href);
	const params = url.searchParams;

	return new RouteInfo({ paths, hash, params });
}
// --------- /utilities --------- //

// <sf-slot name="route-end-slot" />