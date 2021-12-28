const prefixer = (await import('autoprefixer')).default;
const importer = (await import('postcss-import')).default;
const nested = (await import('postcss-nested')).default;

const plugins = [
	prefixer,
	importer,
	nested
];

export default {
	// required. Support single string, or array, will be processed in order
	input: ['./pcss/main.pcss', './src/**/*.pcss'],

	// required. single css file supported for now. 
	output: '../../services/admin-server/web-folder/css/all-bundle.css',

	watchPath: ['./**/*.pcss', '../_common/**/*.pcss'],


	// postcss processor arrays
	plugins
}