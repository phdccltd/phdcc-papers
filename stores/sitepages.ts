import { defineStore } from 'pinia'

export const useSitePagesStore = defineStore('sitepages', {
  /*persist: {
    enabled: true,
    strategies: [
      // These are sticky preferences.
      {
        storage: localStorage,
        paths: ['vals'],
      },
    ],
  },*/
  state: () => ({
    vals: {},
  }),
  actions: {
    set(params) {
      this.vals[params.key] = params.value
    },
  },
  getters: {
    get: (state) => (key) => {
      return state.vals[key]
    },
  },
})