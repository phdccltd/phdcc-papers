require('dotenv').config()
const fs = require('fs')
const execSync = require('child_process').execSync
const execFileSync = require('child_process').execFileSync

console.log('papers NODE_ENV', process.env.NODE_ENV)
console.log('papers API', process.env.API)

const packageJson = fs.readFileSync('./package.json')
const version = JSON.parse(packageJson).version || 0
console.log('version', version)

if (process.env.STARTUP_EMAIL && process.env.STARTUP_SUBJECT && process.env.STARTUP_FROM && !('npm_lifecycle_script' in process.env)) {
  console.log('SEND MAIL TO ', process.env.STARTUP_EMAIL)
  const now = new Date()
  const args = ['-s', process.env.STARTUP_SUBJECT + ' ' + version, '-a', 'From:' + process.env.STARTUP_FROM, process.env.STARTUP_EMAIL]
  execFileSync('mail', args, { input: 'Server: ' + now.toISOString() + ' to API ' + process.env.API })
}

module.exports = {
  ////mode: 'universal',
  //mode: 'spa',
  ssr: false,
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
  css: ['@/assets/css/global.scss'],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    // $api setup
    { src: '~/plugins/api.js' },

    // Some plugins are client-side features
    { src: '~/plugins/localStorage.js', ssr: false },
    { src: '~/plugins/vue-awesome.js', ssr: false },
    { src: '~/plugins/vue-popper.js', ssr: false },
  ],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    //'@nuxtjs/eslint-module',
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
    // Doc: https://auth.nuxtjs.org/
    '@nuxtjs/auth',
    // Doc: https://github.com/nuxt-community/recaptcha-module
    '@nuxtjs/recaptcha'
  ],
  recaptcha: {
    /* reCAPTCHA options */
    siteKey: process.env.RECAPTCHA_SITE_KEY,
    version: 3
  },
  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {
    //proxy: true,
    retry: {
      // Retry failed requests to give a bit more resilience to flaky networks, especially on mobile.
      // This also helps with server upgrades.
      //
      // Note that this doesn't retry requests that never complete.
      retries: 1,
      retryDelay: retryCount => {
        return retryCount * 1000
      },
      // eslint-disable-next-line handle-callback-err
      retryCondition: error => {
        return true
      },
      shouldResetTimeout: true
    }
  },

  //proxy: {
  //  '/api/': process.env.API
  //},
  /*
   ** Build configuration
   */
  build: {
    transpile: [/^vue-awesome/],  // node_modules/bootstrap-vue/src/icons/icons.js
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
      config.resolve.alias['color-vars'] = 'assets/css/_color-vars.scss'
    },
  },
  env: {
    API: process.env.API,
    BUILD_DATE: new Date().toLocaleString('en-US'),
    RECAPTCHA_BYPASS: process.env.RECAPTCHA_BYPASS,
    VERSION: version,
  },
  // We only use some of bootstrap-vue, so by listing it explicitly we can reduce our bundle size.
  bootstrapVue: {
    // bootstrapCSS: false, // here you can disable automatic bootstrapCSS in case you are loading it yourself using sass
    // bootstrapVueCSS: false, // CSS that is specific to bootstrapVue components can also be disabled. That way you won't load css for modules that you don't use
    componentPlugins: [ // https://bootstrap-vue.org/docs/components
      'AlertPlugin',
      'ButtonPlugin',
      'CardPlugin',
      'CollapsePlugin',
      'FormPlugin',
      'FormCheckboxPlugin',
      'FormFilePlugin',
      'FormGroupPlugin',
      'FormInputPlugin',
      'FormRadioPlugin',
      'FormSelectPlugin',
      'FormTextareaPlugin',
      //'InputGroupPlugin',
      'LayoutPlugin',
      'LinkPlugin',
      'ListGroupPlugin',
      'ModalPlugin',
      //'NavPlugin',
      //'NavbarPlugin',
      'PopoverPlugin',
      'BVToastPlugin'
    ],
    directivePlugins: [ // https://bootstrap-vue.org/docs/directives
      //'VBPopoverPlugin',  // included in plugin vue-popper.js
      //'TooltipPlugin',    // included in plugin vue-popper.js
    ],
  },

  auth: {
    strategies: {
      local: {
        endpoints: {
          login: { url: process.env.API + '/user/login', method: 'post', propertyName: 'token' },
          logout: { url: process.env.API +'/user/logout', method: 'delete'},
          user: { url: process.env.API + '/user', method: 'get', propertyName: 'user' },
          // register handled separately
        },
        tokenRequired: true,
        tokenType: 'bearer',
      },
    },
    redirect: {
      home: false,
      callback: false,
      logout: false
    },
    cookie: false,
  },
}
