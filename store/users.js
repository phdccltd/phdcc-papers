//console.log('init store users')
const _ = require('lodash/core')
import Vue from 'vue'

export const state = () => ({
  pubpubusers: {},
  error: false,
  //list: [],
})

export const mutations = {
  addPubUsers(state, puholder) {
    //console.log('addPubFlow', pubflow)
    Vue.set(state.pubpubusers, puholder.pubid, puholder.pubusers)
  },
  setError(state, error) {
    //console.log('submit.setError', error)
    state.error = error
  },

  /*add(state, item) {
    console.log('add user', item)
    state.push(item)
  },

  setList(state, list) {
    console.log('setList user', list)
    state.list = list
  },

  clearAll(state) {
    console.log('clearAll user')
    state.list = []
    state.pubpubusers = {}
    state.error = false
  },*/
}

export const getters = {
  pubusers(state) {
    //console.log('getter submits.flows.pubid')
    return (pubid) => {
      //console.log('getter submits.flows pubid', pubid)
      const pubusers = _.find(state.pubpubusers, (pubusers, thispubid) => { return parseInt(thispubid) === pubid })
      return pubusers
    }
  },
  /*list: (state) => {
    console.log('getter user.list')
    return state.list
  },*/
  error: state => state.error,
}

export const actions = {
  async fetchpubusers({ commit }, pubid) {
    try {
      //console.log('store fetchpub submits.actions', pubid)
      const { pubusers } = await this.$api.user.getPubUsers(pubid)
      commit('addPubUsers', { pubid, pubusers })
    }
    catch (e) {
      console.log('users fetchpubusers', e.message)
      commit('setError', e.message)
    }
  },

  clearError({ commit }) {
    //console.log('clearError submits.action')
    commit('setError', false)
  },
}
