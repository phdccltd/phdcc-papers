import Vue from 'vue'
const _ = require('lodash/core')

// console.log('init store pubs')
export const state = () => ({
  pubs: {},
  error: false
})

export const mutations = {
  setPubs (_state, pubs) {
    // console.log('setPubs', pubs)
    _state.pubs = {}
    if (pubs) {
      for (const pub of pubs) {
        Vue.set(_state.pubs, pub.id, pub)
      }
    }
  },
  setError (_state, error) {
    // console.log('submit.setError', error)
    _state.error = error
  },

  clearAll (_state) {
    // console.log('clearAll pubs')
    _state.pubs = {}
    _state.error = false
  }
}

export const getters = {
  get (_state) {
    // console.log('getter pubs.get')
    return _state.pubs
  },
  getPub (_state) {
    return (pubid) => {
      // console.log('getter pubs.getPub', pubid, typeof pubid)
      return _.find(_state.pubs, pub => { return pub.id === pubid })
    }
  },
  error: _state => _state.error
}

export const actions = {
  async fetch ({ commit, store }) {
    try {
      // console.log('store fetch pubs.actions')
      commit('setError', false)
      const { pubs } = await this.$api.pub.fetch({})
      for (const pub of pubs) { // Add working variables here (so they are reactive)
        pub.owner = Boolean(_.find(pub.myroles, mr => { return mr.isowner }))
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
