//console.log('init store users')
const _ = require('lodash/core')
import Vue from 'vue'

export const state = () => ({
  pubpubusers: {},
  error: false,
})

export const mutations = {
  addPubUsers(state, puholder) {
    //console.log('addPubFlow', pubflow)
    Vue.set(state.pubpubusers, puholder.pubid, puholder.pubusers)
  },
  setError(state, error) {
    //console.log('users.setError', error)
    state.error = error
  },
  clearAll(state) {
    //console.log('clearAll user')
    state.pubpubusers = {}
    state.error = false
  },
}

export const getters = {
  pubusers(state) {
    //console.log('getter users.pubusers.pubid')
    return (pubid) => {
      //console.log('getter users.pubusers.pubid', pubid)
      const pubusers = _.find(state.pubpubusers, (pubusers, thispubid) => { return parseInt(thispubid) === pubid })
      return pubusers
    }
  },
  error: state => state.error,
}

export const actions = {
  async fetchpubusers({ commit }, pubid) {
    try {
      //console.log('store fetchpubusers users.actions', pubid)
      const { pubusers } = await this.$api.user.getPubUsers(pubid)
      commit('addPubUsers', { pubid, pubusers })
    }
    catch (e) {
      console.log('users fetchpubusers', e.message)
      commit('setError', e.message)
    }
  },

  clearError({ commit }) {
    //console.log('clearError users.action')
    commit('setError', false)
  },

  clear({ commit }) {
    //console.log('clear users.action')
    commit('clearAll')
  },
}
