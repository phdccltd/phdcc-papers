import _ from 'lodash/core'
import { defineStore } from 'pinia'
import api from '~/api'

export const useSitePagesStore = defineStore('sitepages', {
  persist: {
    enabled: true,
    strategies: [
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
      const { sitepages } = await api.sitepages.fetch({})
      if (sitepages) {
        for (const sitepage of sitepages) {
          sitepage.visible = false
          sitepage.paras = sitepage.content.split('\n')
        }
      }
      this.list = sitepages
    },
  },
  getters: {
    get: (_state: { list: any }) => {
      return (path: any) => {
        return _.find(_state.list, (_sitepage: { path: any }) => { return _sitepage.path === path })
      }
    },
  },
})