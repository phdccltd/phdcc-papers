import _ from 'lodash/core'
import { defineStore } from 'pinia'
import api from '~/api'

export const usePubsStore = defineStore('pubs', {
  persist: {
    enabled: true,
    strategies: [
      // These are sticky preferences.
      {
        storage: localStorage,
        //paths: ['list'],
      },
    ],
  },
  state: () => ({
    pubs: {},
    error: false
  }),
  actions: {
    async fetch() {
      try {
        // console.log('store fetch pubs.actions')
        this.error = false
        const { pubs } = await api.pubs.fetch({})
        for (const pub of pubs) { // Add working variables here (so they are reactive)
          pub.owner = Boolean(_.find(pub.myroles, (mr: any ) => { return mr.isowner }))
          pub.notowner = pub.owner ? false : (pub.myroles.length > 0)
          pub.superedit = false
          pub.adduserid = 0
          pub.addroleid = 0
          pub.hasanyrole = false
          if ('superpubroles' in pub) {
            pub.hasanyrole = pub.superpubroles.length > 0
          }
        }
        // console.log('fetch setpubs', pubs)
        this.pubs = pubs
      } catch (e: any) {
        console.log('store fetchpub error', e.message)
        this.error = e.message
      }
    },
    clearError() {
      this.error = false
    },

    clear() {
      this.error = false
    }
  },
  getters: {
    getPub: (state: { pubs: any }) => (pubid: any) => {
      // console.log('getter pubs.getPub', pubid, typeof pubid)
      return _.find(state.pubs, (pub: { id: any }) => { return pub.id === pubid })
    }
  },
})