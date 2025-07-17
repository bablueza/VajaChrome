import adapter from 'sveltekit-adapter-chrome-extension';
/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			pages: 'dist',
			assets: 'dist',
			precompress: false,
			fallback: 'null',
			manifest: 'manifest.json'
		}),
		appDir: 'app'
	}
};
export default config;
