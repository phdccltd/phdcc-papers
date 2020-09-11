// WHEN/HOW TO RESET
const _ = require('lodash/core')
import Vue from 'vue'

//console.log('init store submits')
export const state = () => ({
  pubflows: {},
  entries: {},
  flowfields: {},
  error: false,
})

export const mutations = {
  addPubFlow(state, pubflow) {
    //console.log('addPubFlow', pubflow)
    Vue.set(state.pubflows, pubflow.pubid, pubflow.flows)
  },
  addEntry(state, item) {
    //console.log('addEntry', item)
    Vue.set(state.entries, item.entryid, item.entry)
  },
  addFormFieldEntry(state, item) {
    //console.log('addFormFieldEntry', item)
    Vue.set(state.flowfields, item.flowstageid, item.entry)
  },
  setError(state, error) {
    //console.log('submit.setError', error)
    state.error = error
  },

  clearAll(state) {
    //console.log('clearAll submits')
    state.pubflows = {}
    state.entries = {}
    state.flowfields = {}
    state.error = false
  },
}

export const getters = {
  flows(state) {
    //console.log('getter submits.flows.pubid')
    return (pubid) => {
      //console.log('getter submits.flows pubid', pubid)
      const flows = _.find(state.pubflows, (flows,thispubid) => { return parseInt(thispubid) === pubid })
      return flows
    }
  },
  entry(state) {
    return (entryid) => {
      //console.log('getter submits.entry entryid', entryid)
      const entry = _.find(state.entries, entry => { return entry.id === entryid })
      //console.log('getter submits.entry entry', entry)
      return entry
    }
  },
  stagefields(state) {
    return (flowstageid) => {
      //console.log('getter submits.stagefields flowstageid', flowstageid)
      const entry = _.find(state.flowfields, (entry, thisflowstageid) => { return parseInt(thisflowstageid) === flowstageid })
      //console.log('getter submits.stagefields entry', entry)
      return entry
    }
  },
  submit(state) {
    return (pubid, submitid) => {
      //console.log('getter submits.submit', pubid, submitid)
      const flows = _.find(state.pubflows, (flows, thispubid) => { return parseInt(thispubid) === pubid })
      if (flows) {
        for (const flow of flows) {
          for (const submit of flow.submits) {
            if (submit.id === submitid) {
              if (!'newstatusid' in submit) submit.newstatusid = 0
              if (!'newreviewerid' in submit) submit.newreviewerid = 0
              for (const entry of submit.entries) {
                entry.stage = _.find(flow.stages, stage => { return stage.id === entry.flowstageId })
              }
              submit.status = 'Status not set'
              submit.dtstatus = false
              let foundvisible = false
              for (const submitstatus of submit.statuses) {
                submitstatus.status = 'Unknown'
                const flowstatus = _.find(flow.statuses, flowstatus => { return flowstatus.id === submitstatus.flowstatusId })
                if (flowstatus) {
                  submitstatus.status = flowstatus.status
                  if (!foundvisible) {
                    submit.status = flowstatus.status
                    submit.dtstatus = submitstatus.dt
                    foundvisible = true
                  }
                }
              }
              return submit
            }
          }
        }
      }
      return false
    }
  },
  error: state => state.error,
}

export const actions = {
  async fetchpub({ commit }, pubid) {
    try {
      //console.log('store fetchpub submits.actions', pubid)
      const { flows } = await this.$api.submit.fetchpub({ pubid })
      // Set collapse visibility for flow and submits
      for (const flow of flows) {
        flow.visible = true
        for (const flowgrade of flow.flowgrades) {
          flowgrade.visible = true
        }
      }
      commit('addPubFlow', { pubid, flows })
    }
    catch (e) {
      console.log('store fetchpub', e.message)
      commit('setError', e.message)
    }
  },

  async fetchentry({ commit}, entryid) {
    //console.log('store action submits/fetchentry', entryid)
    try {
      const { entry } = await this.$api.submit.fetchentry({ entryid })
      for (const field of entry.fields) {
        field.message = ''
      }
      commit('addEntry', { entryid, entry })
    }
    catch (e) {
      console.log('store fetchentry', e.message)
      commit('setError', e.message)
    }
  },

  async fetchformfields({ commit }, flowstageid) {
    //console.log('store fetchformfields submits.actions A', flowstageid)
    try {
      const { entry } = await this.$api.submit.fetchformfields({ flowstageid })
      //console.log('store fetchformfields submits.actions B', flowstageid, entry)
      // Provide empty field values here so entry is reactive
      for (const field of entry.fields) {
        field.val = {
          string: null,
          text: null,
          integer: null,
          file: null,
          newfile: null,
        }
        field.message = ''
      }
      commit('addFormFieldEntry', { flowstageid, entry })
    }
    catch (e) {
      console.log('store fetchformfields', e.message)
      commit('setError', e.message)
    }
  },

  clearError({ commit }) {
    //console.log('clearError submits.action')
    commit('setError', false)
  },

  clear({ commit }) {
    //console.log('clear submits.action')
    commit('clearAll')
  },

  async addEntry({ commit, getters, dispatch }, entry) {
    console.log('store action submits/addEntry', entry)
    const { id } = await this.$api.submits.add(entry)
    //await dispatch('fetchentry', { id })
    return id
  },

}
