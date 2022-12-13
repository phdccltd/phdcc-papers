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

        // Just persist everything
        //paths: ['authorization'],
      },
    ],
  },
  state: () => ({
    allusers: [],
    pubpubusers: {},
    error: false
  }),
  actions: {
    /*setAllUsers(allusers) {
      console.log('setUsers', allusers)
      this.allusers = allusers
    },
    addPubUsers(puholder) {
      console.log('addPubFlow', pubflow)
      this.pubpubusers[puholder.pubid] = puholder.pubusers
      //Vue.set(_state.pubpubusers, puholder.pubid, puholder.pubusers)
    },
    setError(error) {
      console.log('users.setError', error)
      this.error = error
    },*/
    clearAll() {
      console.log('clearAll user')
      this.pubpubusers = {}
      this.error = false
    },
    async fetchallusers() {
      try {
        // console.log('store fetchallusers users.actions', pubid)
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
      // console.log('clearError users.action')
      this.error = false
    },

    clear() {
      // console.log('clear users.action')
      this.clearAll()
    }
  },
  getters: {
    //getToken: (state: { authorization: string | null }) => {
    //  return state.authorization
    //},
    getall: (state) => () => {
      // console.log('getter users.getall')
      return state.allusers
    },
    pubusers: (state) => (pubid) => {
      // console.log('getter users.pubusers.pubid', pubid)
      const pubusers = _.find(state.pubpubusers, (_pubusers, thispubid) => { return parseInt(thispubid) === pubid })
      return pubusers
    },
  },
}
)