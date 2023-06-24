// import config from "./config";

// Generated brokenly:
// .nuxt\tsconfig.json: "pinia": [
//    "node_modules/@pinia/nuxt/node_modules/pinia/dist/pinia"
// ]

import fs from 'fs'

const packageJson = fs.readFileSync('./package.json', 'utf8')
const version = JSON.parse(packageJson).version || 0
console.log('Building phdcc-papers', version)

import istanbul from 'vite-plugin-istanbul';

export default defineNuxtConfig({
  ssr: false,
  build: {
    // Reduce size of CSS initial load.
    // extractCSS: true
  },

  alias: {
    pinia: '/node_modules/@pinia/nuxt/node_modules/pinia/dist/pinia.mjs',
  },

  modules: ['@bootstrap-vue-next/nuxt', '@pinia/nuxt', 'unplugin-icons/nuxt'],
  plugins: [
    // No need but it's there: '~/plugins/pinia-plugin-persist.client'
  ],

  runtimeConfig: {
    // The private keys which are only available server-side
    
    // Keys within public are also exposed client-side + overridden by .env
    public: {
      API: process.env.API || '/api',
      RECAPTCHA_SITE_KEY: process.env.RECAPTCHA_SITE_KEY || '',
      RECAPTCHA_BYPASS: process.env.RECAPTCHA_BYPASS || '',
      SITE: process.env.SITE || '',
      VERSION: version,
      BUILD_DATE: new Date().toISOString(),
      STARTUP_EMAIL: process.env.STARTUP_EMAIL || '',
      STARTUP_SUBJECT: process.env.STARTUP_SUBJECT || '',
      STARTUP_FROM: process.env.STARTUP_FROM || ''
    },
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
        },
      },
    },
    plugins: [
      /*istanbul({ // For Cypress testing
        // See also: https://github.com/iFaxity/vite-plugin-istanbul/issues/28
        include: ['api/*', 'components/*', 'composables/*', 'layouts/*', 'middleware/*', 'mixins/*', 'pages/**', 'plugins/*', 'stores/*', 'utils/*'],
        exclude: ['node_modules', 'test/'],
        extension: ['.js', '.ts', '.vue'],
        cypress: true,
        requireEnv: true,
      })*/
    ]
  },
  css: [
    '@/node_modules/@fortawesome/fontawesome-svg-core/styles.css',
    'bootstrap/dist/css/bootstrap.min.css',
    '@/assets/css/_global.scss',
  ],
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
  },
})
