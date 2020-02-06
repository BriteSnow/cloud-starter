export { }; // to make this file a module

declare global {
	interface HTMLElement {
		extra: any;
		origValue: any;
	}
	interface Window {
		__version__: string;
	}
}