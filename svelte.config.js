import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      fallback: '404.html'
    }),
    paths: {
      base: process.env.BASE_PATH ?? ''
    },
    prerender: {
      handleHttpError: ({ path, referrer, message }) => {
        if (path.endsWith('/favicon.png')) return;
        throw new Error(message);
      }
    }
  }
};

export default config;
