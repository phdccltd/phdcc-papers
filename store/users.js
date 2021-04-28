// console.log('init store users')
import Vue from 'vue'
const _ = require('lodash/core')

export const state = () => ({
  allusers: [],
  pubpubusers: {},
  error: false
})

export const mutations = {
  setAllUsers(_state, allusers) {
    // console.log('setUsers', allusers)
    _state.allusers = allusers
  },
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
  getall(_state) {
    // console.log('getter users.getall')
    return _state.allusers
  },
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
  async fetchallusers({ commit }) {
    try {
      // console.log('store fetchallusers users.actions', pubid)
      const { allusers } = await this.$api.user.getUsers()
      commit('setAllUsers', allusers)
    } catch (e) {
      console.log('users fetchallusers', e.message)
      commit('setError', e.message)
    }
  },

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
