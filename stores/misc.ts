import { defineStore } from 'pinia'

export const useMiscStore = defineStore('misc', {
  persist: {
    enabled: true,
    strategies: [
      // These are sticky preferences.
      {
        storage: localStorage,
        paths: ['vals'],
      },
    ],
  },
  state: () => ({
    vals: {},
  }),
  actions: {
    set(params: any) {
      this.vals[params.key] = params.value
      if( params.key==='page-title'){
        this.vals['page-title-suffix'] = ''
      }
    },
    clearAll() {
      this.vals = {}
    }
  },
  getters: {
    get: (state: { vals: { [x: string]: any } }) => (key: string) => {
      if( key in state.vals){
      return state.vals[key]
      } else return null
    },
  },
})