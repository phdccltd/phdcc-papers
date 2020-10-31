import Vue from 'vue'
const _ = require('lodash/core')

// console.log('init store pubs')
export const state = () => ({
  pubs: {},
  error: false
})

export const mutations = {
  setPubs (state, pubs) {
    // console.log('setPubs', pubs)
    state.pubs = {}
    if (pubs) {
      for (const pub of pubs) {
        Vue.set(state.pubs, pub.id, pub)
      }
    }
  },
  setError (state, error) {
    // console.log('submit.setError', error)
    state.error = error
  },

  clearAll (state) {
    // console.log('clearAll pubs')
    state.pubs = {}
    state.error = false
  }
}

export const getters = {
  get (state) {
    // console.log('getter pubs.get')
    return state.pubs
  },
  getPub (state) {
    return (pubid) => {
      // console.log('getter pubs.getPub', pubid, typeof pubid)
      return _.find(state.pubs, pub => { return pub.id === pubid })
    }
  },
  error: state => state.error
}

export const actions = {
  async fetch ({ commit, store }) {
    try {
      // console.log('store fetch pubs.actions')
      commit('setError', false)
      const { pubs } = await this.$api.pub.fetch({})
      // console.log('fetch setpubs', pubs)
      commit('setPubs', pubs)
    } catch (e) {
      console.log('store fetchpub', e.message)
      commit('setError', e.message)
    }
  },

  clearError ({ commit }) {
    // console.log('clearError submits.action')
    commit('setError', false)
  },

  clear ({ commit }) {
    // console.log('clear pubs.action')
    commit('clearAll')
  }
}
