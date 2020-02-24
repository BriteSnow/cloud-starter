
export interface DispItem {
	id: number;
	name: string;
}

export interface ApiResponse<T> {
	success: boolean,
	data?: T
}
