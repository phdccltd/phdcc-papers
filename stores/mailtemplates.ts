import _ from 'lodash/core'
import { defineStore } from 'pinia'
import api from '~/api'

export const useMailTemplatesStore = defineStore('mailtemplates', {
  persist: {
    enabled: true,
    strategies: [
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
    setError(error) {
      this.error = error
    },
    async fetch(pubid) {
      try {
        const { pubmails } = await api.mail.getTemplates(pubid)
        for (const pubmail of pubmails) {
          pubmail.visible = false
          pubmail.bodyParas = pubmail.body.split('\n')
        }
        this.mailtemplates[pubid] = pubmails
      } catch (e) {
        console.log('mailtemplates fetch', e.message)
        this.error = e.message
      }
    },

    clearError() {
      this.error = false
    }
  },
  getters: {
    get(state) {
      return (pubid) => {
        const mailtemplates = _.find(state.mailtemplates, (_mailtemplates, thispubid) => { return parseInt(thispubid) === pubid })
        return mailtemplates
      }
    },
  },
})


