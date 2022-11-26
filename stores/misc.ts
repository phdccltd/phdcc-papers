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
    time: null,
    vals: {},
  }),
  actions: {
    set(params: any) {
      console.log("SET",params.key,params.value)
      this.vals[params.key] = params.value
    },
    setTime() {
      this.time = new Date()
    },
  },
  getters: {
    get: (state: { vals: { [x: string]: any } }) => (key: string) => {
      if( key in state.vals){
      return state.vals[key]
      } else return null
    },
  },
})