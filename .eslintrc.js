module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: 'espree',
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  env: {
    browser: true,
    node: true,
  },
  extends: ['@nuxtjs', 'plugin:prettier/recommended'],
  // add your custom rules here
  rules: {
    // 'prettier/prettier': 0,
    'no-console': 'off',
    // 'proseWrap': 'off',
    // 'max-len': ['error', { code: 240 }],
    // no-v-model-argument rule is broken for Vue3, which requires that syntax for .sync.
    'vue/no-v-model-argument': 'off',
    'vue/multi-word-component-names': [
      'error',
      {
        // error page for custom errors triggers this, so ignore it.
        ignores: ['error'],
      },
    ],
  },
  overrides: [
    {
      files: ['layouts/*.vue', 'pages/**/*.vue'],
      rules: {
        // Not sure why we have two copies of this, one above and one here, but this one makes [id] work.
        'vue/multi-word-component-names': 'off',
      },
    },
  ],
  globals: {
    process: 'readonly',
    defineAppConfig: 'readonly',
    defineProps: 'readonly',
    definePageMeta: 'readonly',
    useRuntimeConfig: 'readonly',
    defineNuxtConfig: 'readonly',
    defineNuxtPlugin: 'readonly',
    defineEmits: 'readonly',
    defineNuxtRouteMiddleware: 'readonly',
    getCurrentInstance: 'readonly',
    useAsyncData: 'readonly',
    useLazyAsyncData: 'readonly',
    createApp: 'readonly',
    useNuxtApp: 'readonly',
    useHead: 'readonly',
    computed: 'readonly',
    usePinia: 'readonly',
    useRoute: 'readonly',
    useState: 'readonly',
  },
}
