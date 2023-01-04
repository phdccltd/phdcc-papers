import path from 'path-browserify'
// import eslintPlugin from 'vite-plugin-eslint'
import legacy from '@vitejs/plugin-legacy'
import config from './config'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Icons from 'unplugin-icons/vite'
import Components from 'unplugin-vue-components/vite'
import IconsResolve from 'unplugin-icons/resolver'

export default defineConfig({
  debug: true,

  // Make the ~ and @ aliases work in Vite as per https://github.com/vitejs/vite/issues/382.
  resolve: {
    alias: [
      {
        find: /~(.+)/,
        replacement: path.join(process.cwd(), 'node_modules/$1'),
      },

      {
        find: /@\//,
        replacement: path.join(process.cwd(), './src/renderer') + '/',
      },
    ],
  },

  plugins: [
    // Make Lint errors cause build failures.
    // eslintPlugin(),
    legacy({
      targets: [
        // We want to try to support XP.
        '> 0.5%, last 2 versions, Firefox ESR, not dead or Chrome >= 49 or Firefox >= 52',
      ],
    }),
    Components({
      resolvers: [IconsResolve()],
      dts: true
    }),
    Icons({
      compiler: 'vue3',
      autoInstall: true
    })
  ],

  server: {
    proxy: {
    },
  },
})
