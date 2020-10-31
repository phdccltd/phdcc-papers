import Vue from 'vue'
const _ = require('lodash/core')

export const state = () => ({
  pubflows: {},
  entries: {},
  flowfields: {},
  error: false
})

export const mutations = {
  addPubFlow (state, pubflow) {
    Vue.set(state.pubflows, pubflow.pubid, pubflow.flows)
  },
  addEntry (state, item) {
    Vue.set(state.entries, item.entryid, item.entry)
  },
  addFormFieldEntry (state, item) {
    Vue.set(state.flowfields, item.flowstageid, item.entry)
  },
  setError (state, error) {
    state.error = error
  },

  clearAll (state) {
    state.pubflows = {}
    state.entries = {}
    state.flowfields = {}
    state.error = false
  }
}

export const getters = {
  flows (state) {
    return (pubid) => {
      // console.log('getter submits.flows pubid', pubid)
      const flows = _.find(state.pubflows, (flows, thispubid) => { return parseInt(thispubid) === pubid })
      return flows
    }
  },
  entry (state) {
    return (entryid) => {
      const entry = _.find(state.entries, entry => { return entry.id === entryid })
      return entry
    }
  },
  stagefields (state) {
    return (flowstageid) => {
      const entry = _.find(state.flowfields, (entry, thisflowstageid) => { return parseInt(thisflowstageid) === flowstageid })
      return entry
    }
  },
  submit (state) {
    return (pubid, submitid) => {
      const flows = _.find(state.pubflows, (flows, thispubid) => { return parseInt(thispubid) === pubid })
      if (flows) {
        for (const flow of flows) {
          for (const submit of flow.submits) {
            if (submit.id === submitid) {
              if (!('newstatusid' in submit)) submit.newstatusid = 0
              if (!('newreviewerid' in submit)) submit.newreviewerid = 0
              for (const entry of submit.entries) {
                entry.stage = _.find(flow.stages, stage => { return stage.id === entry.flowstageId })
              }
              submit.status = 'Status not set'
              submit.dtstatus = ''
              submit.owneradvice = false
              let foundvisible = false
              for (const submitstatus of submit.statuses) {
                submitstatus.status = 'Unknown'
                const flowstatus = _.find(flow.statuses, flowstatus => { return flowstatus.id === submitstatus.flowstatusId })
                if (flowstatus) {
                  submitstatus.status = flowstatus.status
                  if (!foundvisible) {
                    submit.owneradvice = flowstatus.owneradvice
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
  error: state => state.error
}

export const actions = {
  async fetchpub ({ commit }, pubid) {
    try {
      const { flows } = await this.$api.submit.fetchpub({ pubid })
      // Set collapse visibility for flow and submits - and tickcolour
      const tickcolours = ['cyan', 'green', 'maroon', 'blue']
      let tickcolourno = 0
      for (const flow of flows) {
        flow.visible = true
        for (const flowgrade of flow.flowgrades) {
          flowgrade.visible = true
          flowgrade.summary = true
          flowgrade.tickcolour = tickcolours[tickcolourno]
          tickcolourno = ++tickcolourno % tickcolours.length
        }
      }
      commit('addPubFlow', { pubid, flows })
    } catch (e) {
      console.log('store fetchpub', e.message)
      commit('setError', e.message)
    }
  },

  async fetchentry ({ commit }, entryid) {
    try {
      const { entry } = await this.$api.submit.fetchentry({ entryid })
      for (const field of entry.fields) {
        field.message = ''
      }
      commit('addEntry', { entryid, entry })
    } catch (e) {
      console.log('store fetchentry', e.message)
      commit('setError', e.message)
    }
  },

  async fetchformfields ({ commit }, flowstageid) {
    try {
      const { entry } = await this.$api.submit.fetchformfields({ flowstageid })
      // Provide empty field values here so entry is reactive
      for (const field of entry.fields) {
        field.val = {
          string: null,
          text: null,
          integer: null,
          file: null,
          newfile: null
        }
        field.message = ''
      }
      commit('addFormFieldEntry', { flowstageid, entry })
    } catch (e) {
      console.log('store fetchformfields', e.message)
      commit('setError', e.message)
    }
  },

  clearError ({ commit }) {
    commit('setError', false)
  },

  clear ({ commit }) {
    commit('clearAll')
  }

  // async addEntry({ commit, getters, dispatch }, entry) {
  //  const { id } = await this.$api.submits.add(entry)
  //  return id
  // },

}
