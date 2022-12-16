import { defineStore } from 'pinia'
import _ from 'lodash/core'
import api from '~/api'

export const useUsersStore = defineStore({
  id: 'users',
  persist: {
    enabled: true,
    strategies: [
      {
        storage: localStorage,
      },
    ],
  },
  state: () => ({
    allusers: [],
    pubpubusers: {},
    error: false
  }),
  actions: {
    clearAll() {
      this.pubpubusers = {}
      this.error = false
    },
    
    async fetchallusers() {
      try {
        const { allusers } = await api.auth.getUsers()
        this.allusers = allusers
      } catch (e) {
        console.log('users fetchallusers', e.message)
        this.error = e.message
      }
    },

    async fetchpubusers(pubid) {
      try {
        const { pubusers } = await api.auth.getPubUsers(pubid)
        this.pubpubusers[pubid] = pubusers
      } catch (e) {
        console.log('users fetchpubusers', e.message)
        this.error = e.message
      }
    },

    clearError() {
      this.error = false
    },
  },
  getters: {
    getall: (state) => () => {
      return state.allusers
    },
    pubusers: (state) => (pubid) => {
      const pubusers = _.find(state.pubpubusers, (_pubusers, thispubid) => { return parseInt(thispubid) === pubid })
      return pubusers
    },
  },
}
)