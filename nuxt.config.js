require('dotenv').config()

const API = '/api'

module.exports = {
  mode: 'universal',
  /*
   ** Headers of the page
   */
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || '',
      },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#fff' },
  /*
   ** Global CSS
   */
  css: [],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    // Iznik $api setup
    { src: '~/plugins/api.js' },
  ],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module',
  ],
  polyfill: {
    // This is needed for IE11.
    features: [
      {
        require: 'mutation-observer',
      },
      {
        require: 'promise-polyfill',
      },
      {
        require: 'event-polyfill',
      },
      {
        require: 'custom-event-polyfill',
      },
      {
        require: 'array-from-polyfill',
      },
      {
        require: 'intersection-observer',
        detect: () => 'IntersectionObserver' in window,
      },
    ],
  },
  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://bootstrap-vue.js.org
    'bootstrap-vue/nuxt',
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
  ],
  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {},
  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {
      if (ctx.isDev) {
        // https://medium.com/js-dojo/debugging-nuxt-js-with-vs-code-60a1a9e75cf6
        config.devtool = ctx.isClient ? 'source-map' : 'inline-source-map'
      }
      /* if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/,
        })
      } */
    },
  },
  env: {
    API,
    BUILD_DATE: new Date().toLocaleString('en-US'),
  },
  // We only use some of bootstrap-vue, so by listing it explicitly we can reduce our bundle size.
  bootstrapVue: {
    // bootstrapCSS: false, // here you can disable automatic bootstrapCSS in case you are loading it yourself using sass
    // bootstrapVueCSS: false, // CSS that is specific to bootstrapVue components can also be disabled. That way you won't load css for modules that you don't use
    componentPlugins: [],
    directivePlugins: [],
  },
  serverMiddleware: [
    // https://nuxtjs.org/api/configuration-servermiddleware/#usage
    // https://blog.lichter.io/posts/nuxt-with-an-api/
    // API middleware
    '~/server/index.js',
    // { path: '/api', handler: '~/api/index.js' }
  ],
}
