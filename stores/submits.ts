import _ from 'lodash/core'
import { defineStore } from 'pinia'
import api from '~/api'

export const useSubmitsStore = defineStore('submits', {
  persist: {
    enabled: true,
    strategies: [
      // These are sticky preferences.
      {
        storage: localStorage,
        //paths: ['list'],
      },
    ],
  },
  state: () => ({
    pubflows: {},
    entries: {},
    flowfields: {},
    error: false
  }),
  actions: {
    async fetchpub(pubid: number) {
      try {
        const { flows } = await api.submit.fetchpub({ pubid })
        // Set collapse visibility for flow and submits - and tickcolour
        const tickcolours = ['cyan', 'green', 'maroon', 'blue']
        let tickcolourno = 0
        for (const flow of flows) {
          flow.visible = true
          for (const flowgrade of flow.flowgrades) {
            flowgrade.visible = true
            flowgrade.summary = true
            flowgrade.tickcolour = tickcolours[tickcolourno]
            tickcolourno = (tickcolourno + 1) % tickcolours.length
          }
        }
        this.pubflows[pubid] = flows // commit('addPubFlow', { pubid, flows })

      } catch (e: any) {
        console.log('store fetchpub error', e.message)
        this.error = e.message
      }
    },
    async fetchentry(entryid: number) {
      try {
        const { entry } = await api.submit.fetchentry({ entryid })
        for (const field of entry.fields) {
          field.message = ''
        }
        this.entries[entryid] = entry;  // commit('addEntry', { entryid, entry })
      } catch (e: any) {
        console.log('store fetchentry', e.message)
        this.error = e.message
      }
    },
    async fetchformfields(flowstageid: number) {
      try {
        const { entry } = await api.submit.fetchformfields({ flowstageid })
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
        this.flowfields[flowstageid] = entry; // commit('addFormFieldEntry', { flowstageid, entry })
      } catch (e) {
        console.log('store fetchformfields', e.message)
        this.error = e.message
      }
    },
    clearError() {
      this.error = false
    },

    clearAll() {
      this.error = false
      this.pubflows = {}
      this.entries = {}
      this.flowfields = {}
    }
  },
  getters: {
    flows: (state) => (pubid: number) => {
      //console.log('getter submits.flows pubid', pubid)
      const flows = _.find(state.pubflows, (_flows, thispubid) => { return parseInt(thispubid) === pubid })
      return flows
    },
    entry: (state) => (entryid: number) => {
      //console.log("submit.get.entry",entryid)
      const entry = _.find(state.entries, _entry => { return _entry.id === entryid })
      return entry
    },
    stagefields: (state) => (flowstageid: number) => {
      const entry = _.find(state.flowfields, (_entry, thisflowstageid) => { return parseInt(thisflowstageid) === flowstageid })
      return entry
    },
    submit: (state) => (pubid: number, submitid: number) => {
      const flows = _.find(state.pubflows, (_flows, thispubid) => { return parseInt(thispubid) === pubid })
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
                const flowstatus = _.find(flow.statuses, _flowstatus => { return _flowstatus.id === submitstatus.flowstatusId })
                if (flowstatus) {
                  submitstatus.status = flowstatus.status
                  if (!foundvisible) {
                    submit.owneradvice = flowstatus.owneradvice // eg "Awaiting: send to council"
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
  }
})