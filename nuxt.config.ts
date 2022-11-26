// import config from "./config";

// Generated brokenly:
// .nuxt\tsconfig.json: "pinia": [
//    "node_modules/@pinia/nuxt/node_modules/pinia/dist/pinia"
// ]

import fs from 'fs'

const packageJson = fs.readFileSync('./package.json', 'utf8')
const version = JSON.parse(packageJson).version || 0
console.log('Building phdcc-papers', version)

export default defineNuxtConfig({
  ssr: false,
  build: {
    // Reduce size of CSS initial load.
    // extractCSS: true
  },

  alias: {
    pinia: '/node_modules/@pinia/nuxt/node_modules/pinia/dist/pinia.mjs',
  },

  modules: ['bootstrap-vue-3/nuxt', '@pinia/nuxt'],
  plugins: [
    // No need but it's there: '~/plugins/pinia-plugin-persist.client'
  ],

  runtimeConfig: {
    // The private keys which are only available server-side

    // Keys within public are also exposed client-side + overridden by .env
    public: {
      API: '/api',
      RECAPTCHA_SITE_KEY: '',
      RECAPTCHA_BYPASS: '',
      SITE: '',
      VERSION: version,
      BUILD_DATE: new Date().toISOString(),
    },
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/assets/css/_colors.scss" as *;',
        },
      },
    },
  },
  css: [
    '@/node_modules/@fortawesome/fontawesome-svg-core/styles.css',
    'bootstrap/dist/css/bootstrap.css',
    //,
    // '@/assets/css/_colors.scss'
  ],
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
  },
})
