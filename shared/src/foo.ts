export interface Bar {
	foo: number;
}

export function newBar(): Bar {
	return { foo: 123 }
}