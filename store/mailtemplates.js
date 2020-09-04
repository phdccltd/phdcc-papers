//console.log('init store mailtemplates')
const _ = require('lodash/core')
import Vue from 'vue'

export const state = () => ({
  flowmailtemplates: {},
  error: false,
  //list: [],
})

export const mutations = {
  addFlowMailTemplate(state, fmtholder) {
    console.log('addFlowMailTemplate', fmtholder)
    Vue.set(state.flowmailtemplates, fmtholder.flowid, fmtholder.mailtemplates)
  },
  setError(state, error) {
    state.error = error
  },
}

export const getters = {
  get(state) {
    return (flowid) => {
      console.log('store mailtemplates getter get flowid', flowid)
      const mailtemplates = _.find(state.flowmailtemplates, (mailtemplates, thisflowid) => { return parseInt(thisflowid) === flowid })
      return mailtemplates
    }
  },
  error: state => state.error,
}

export const actions = {
  async fetch({ commit }, flowid) {
    try {
      console.log('store mailtemplates submits.fetch', flowid)
      const { mailtemplates } = await this.$api.mailtemplates.get(flowid)
      commit('addFlowMailTemplate', { flowid, mailtemplates })
    }
    catch (e) {
      console.log('mailtemplates fetch', e.message)
      commit('setError', e.message)
    }
  },

  clearError({ commit }) {
    //console.log('clearError submits.action')
    commit('setError', false)
  },
}
