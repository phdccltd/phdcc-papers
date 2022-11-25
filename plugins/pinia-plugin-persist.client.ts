// plugins/pinia-plugin-persist.client.ts

import piniaPersist from '../utils/pinia-plugin-persist'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.$pinia?.use(piniaPersist)
})