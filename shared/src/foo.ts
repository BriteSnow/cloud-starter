


export const MEDIA_TYPES = ['image', 'video'] as const;

// Will cause ts-json-schema-generator to fail
// export const MEDIA_TYPES = Object.freeze(['image', 'video'] as const);

type MediaType = typeof MEDIA_TYPES[number];

export class Media {
	type?: MediaType
}

