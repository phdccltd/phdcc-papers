import _ from 'lodash/core'
import { defineStore } from 'pinia'
import api from '~/api'

export const useMailTemplatesStore = defineStore('mailtemplates', {
  persist: {
    enabled: true,
    strategies: [
      // These are sticky preferences.
      {
        storage: localStorage,
      },
    ],
  },
  state: () => ({
    mailtemplates: {},
    error: false
  }),
  actions: {
    /*addMailTemplate(fmtholder) {
      console.log('addMailTemplate', fmtholder)
      this.mailtemplates[fmtholder.pubid] = fmtholder.pubmails
      //Vue.set(_state.mailtemplates, fmtholder.pubid, fmtholder.pubmails)
    },*/
    setError(error) {
      this.error = error
    },
    async fetch(pubid) {
      try {
        console.log('store mailtemplates submits.fetch', pubid)
        const { pubmails } = await api.mail.getTemplates(pubid)
        for (const pubmail of pubmails) {
          pubmail.visible = false
        }
        console.log('pubmails', pubmails)
        this.mailtemplates[pubid] = pubmails
        //commit('addMailTemplate', { pubid, pubmails })
      } catch (e) {
        console.log('mailtemplates fetch', e.message)
        this.error = e.message
        //commit('setError', e.message)
      }
    },

    clearError() {
      // console.log('clearError submits.action')
      this.error = false
      //commit('setError', false)
    }
  },
  getters: {
    get(state) {
      return (pubid) => {
        console.log('store mailtemplates getter get pubid', pubid)
        const mailtemplates = _.find(state.mailtemplates, (_mailtemplates, thispubid) => { return parseInt(thispubid) === pubid })
        return mailtemplates
      }
    },
  },
})


