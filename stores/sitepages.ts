// ALMOST DONE
import _ from 'lodash/core'
import { defineStore } from 'pinia'
import api from '~/api'

const $api = api()
//console.log("---", $api)

export const useSitePagesStore = defineStore('sitepages', {
  persist: {
    enabled: true,
    strategies: [
      // These are sticky preferences.
      {
        storage: localStorage,
        paths: ['list'],
      },
    ],
  },
  state: () => ({
    list: [],
    error: false
  }),
  actions: {
    async fetch() {
      const { sitepages } = await $api.sitepages.fetch({})
      // console.log('fetch setList sitepages', sitepages)
      for (const sitepage of sitepages) {
        sitepage.visible = false
      }
      this.list = sitepages;
    },
    //set(params) {
    // this.list[params.key] = params.value
    //},
  },
  getters: {
    get: (_state: { list: any }) => {
      return (path: any) => {
        return _.find(_state.list, (_sitepage: { path: any }) => { return _sitepage.path === path })
      }
    },
  },
})