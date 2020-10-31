// console.log('init store mailtemplates')
import Vue from 'vue'
const _ = require('lodash/core')

export const state = () => ({
  mailtemplates: {},
  error: false
})

export const mutations = {
  addMailTemplate (state, fmtholder) {
    console.log('addMailTemplate', fmtholder)
    Vue.set(state.mailtemplates, fmtholder.pubid, fmtholder.pubmails)
  },
  setError (state, error) {
    state.error = error
  }
}

export const getters = {
  get (state) {
    return (pubid) => {
      console.log('store mailtemplates getter get pubid', pubid)
      const mailtemplates = _.find(state.mailtemplates, (mailtemplates, thispubid) => { return parseInt(thispubid) === pubid })
      return mailtemplates
    }
  },
  error: state => state.error
}

export const actions = {
  async fetch ({ commit }, pubid) {
    try {
      // console.log('store mailtemplates submits.fetch', pubid)
      const { pubmails } = await this.$api.mail.getTemplates(pubid)
      for (const pubmail of pubmails) {
        pubmail.visible = false
      }
      commit('addMailTemplate', { pubid, pubmails })
    } catch (e) {
      console.log('mailtemplates fetch', e.message)
      commit('setError', e.message)
    }
  },

  clearError ({ commit }) {
    // console.log('clearError submits.action')
    commit('setError', false)
  }
}
