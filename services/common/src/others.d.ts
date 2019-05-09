
declare module 'postgres-array' {
	function parse(source: string): string[];
	function parse<T>(source: string, transform: (value: string) => T): T[];
}