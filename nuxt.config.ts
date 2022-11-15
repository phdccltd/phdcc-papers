export default defineNuxtConfig({
    //ssr: false,
    runtimeConfig: {
      // The private keys which are only available server-side

      // Keys within public are also exposed client-side
      public: {
        api: '/api'
      }
    },
    vite: {
      css: {
        preprocessorOptions: {
          scss: {
            additionalData: '@use "@/assets/_colors.scss" as *;'
          }
        }
      }
    },
    app: {
      pageTransition: { name: 'page', mode: 'out-in' }
    }
  })
  