



/** Export first class name that starts with */
export function firstCssWithPrefix<T extends HTMLElement | undefined | null>(el: T, prefix: string): T extends HTMLElement ? string : T;
export function firstCssWithPrefix<T extends HTMLElement | undefined | null>(el: T, prefix: string): string | T {
	if (el == null) return el;
	const name = Array.from(el.classList.values()).filter(v => v.startsWith(prefix))[0];
	return name ?? null;
}


