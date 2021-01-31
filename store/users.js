// console.log('init store users')
import Vue from 'vue'
const _ = require('lodash/core')

export const state = () => ({
  pubpubusers: {},
  error: false
})

export const mutations = {
  addPubUsers (_state, puholder) {
    // console.log('addPubFlow', pubflow)
    Vue.set(_state.pubpubusers, puholder.pubid, puholder.pubusers)
  },
  setError (_state, error) {
    // console.log('users.setError', error)
    _state.error = error
  },
  clearAll (_state) {
    // console.log('clearAll user')
    _state.pubpubusers = {}
    _state.error = false
  }
}

export const getters = {
  pubusers (_state) {
    // console.log('getter users.pubusers.pubid')
    return (pubid) => {
      // console.log('getter users.pubusers.pubid', pubid)
      const pubusers = _.find(_state.pubpubusers, (_pubusers, thispubid) => { return parseInt(thispubid) === pubid })
      return pubusers
    }
  },
  error: _state => _state.error
}

export const actions = {
  async fetchpubusers ({ commit }, pubid) {
    try {
      // console.log('store fetchpubusers users.actions', pubid)
      const { pubusers } = await this.$api.user.getPubUsers(pubid)
      commit('addPubUsers', { pubid, pubusers })
    } catch (e) {
      console.log('users fetchpubusers', e.message)
      commit('setError', e.message)
    }
  },

  clearError ({ commit }) {
    // console.log('clearError users.action')
    commit('setError', false)
  },

  clear ({ commit }) {
    // console.log('clear users.action')
    commit('clearAll')
  }
}
