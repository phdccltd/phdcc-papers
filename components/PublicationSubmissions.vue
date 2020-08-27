<template>
  <div>
    <b-list-group class="flows">
      <b-list-group-item v-for="(flow, index) in flows" :key="index" class="flow">
        <h2 v-bind:class="submitid?'':'bg-yellow'">
          <b-btn variant="link" @click="toggleFlowShow(flow)">
            <v-icon v-if="flow.submitsallvisible" name="minus-square" scale="2" />
            <v-icon v-if="!flow.submitsallvisible" name="plus-square" scale="2" />
          </b-btn>
          {{ flow.name }}
          <b-btn v-if="flow.addtype" variant="success" :to="'/panel/'+pubid+'/'+flow.id+'/add/'+flow.addid">Add {{flow.addtype}}</b-btn>
        </h2>
        <b-list-group class="flows">
          <b-list-group-item v-for="(submit, index) in flow.filteredsubmits" :key="index" class="submit">
            <h3>
              <b-btn variant="link" @click="toggleSubmitShow(submit)">
                <v-icon v-if="submit.visible" name="minus-square" scale="2" />
                <v-icon v-if="!submit.visible" name="plus-square" scale="2" />
              </b-btn>
              <b-btn v-if="showdeletebutton" variant="outline-warning" class="float-right" @click="deleteSubmit(submit.id)">
                Delete
              </b-btn>

              {{ submit.id }}:
              {{ submit.name }}
              <b-btn variant="link" @click="editSubmitName(submit)">
                <v-icon name="edit" scale="1.5" class="btn-outline-warning" />
              </b-btn>
              - <span class="status">{{ submit.status}}</span>
            </h3>
            <b-list-group class="entries" v-if="submit.visible">
              <b-list-group-item v-for="(entry, index) in submit.entries" :key="index" class="entry">
                <PaperDate :dt="entry.dt" />
                <b-btn variant="outline-success" :to="'/panel/'+pubid+'/'+flow.id+'/'+submit.id+'/'+entry.id">
                  {{entry.stage.name}}
                </b-btn>
              </b-list-group-item>
              <div v-if="submit.addtype">
                <b-btn variant="success" :to="'/panel/'+pubid+'/'+flow.id+'/'+submit.id+'/add/'+submit.addid">Add {{submit.addtype}}</b-btn>
              </div>
            </b-list-group>
          </b-list-group-item>
        </b-list-group>
      </b-list-group-item>
    </b-list-group>
    <div v-if="noflows" class="mt-2">
      <strong>No submission workflows yet</strong>
    </div>
    <div v-if="nowtavailable" class="mt-2">
      <strong>Nothing submitted yet</strong>
    </div>

    <b-modal id="bv-modal-edit-submit-title" centered @ok="okTitleEdited">
      <template v-slot:modal-title>
        Edit submission title
      </template>
      <form ref="form" @submit.stop.prevent="submitTitleEdited">
        <b-form-group label="Title"
                      label-for="new-title"
                      invalid-feedback="Title is required">
          <b-form-input id="new-title" required v-model="newtitle"></b-form-input>
        </b-form-group>
      </form>
    </b-modal>
  </div>
</template>
<script>
  import PaperDate from '~/components/PaperDate'
  const _ = require('lodash/core')
  import { page } from '@/utils/phdcc'

  export default {
    components: { PaperDate, },
    mixins: [],
    props: {
      pubid: {
        type: Number,
        required: true,
      },
      flowid: {
        type: Number,
        required: false,
        default: 0,
      },
      submitid: {
        type: Number,
        required: false,
        default: 0,
      },
      setError: {
        type: Function,
        required: true,
      },
      setMessage: {
        type: Function,
        required: true,
      },
    },
    data: function () {
      return {
        noflows: false,
        nowtavailable: false,
        showdeletebutton: true,
        submitbeingedited: false,
        newtitle: '',
      }
    },
    computed: {
      flows() {
        //console.log('PUB flows', this.pubid)

        // Naughtily get pub title here
        const pub = this.$store.getters['pubs/getPub'](this.pubid)
        if (pub) {
          page.title = pub.name
          document.title = pub.name
          this.$store.commit("page/setTitle", page.title)
        } else {
          this.setError('Invalid pubid')
          return false
        }
        
        // Get flows and work out follow-on properties
        let flows = this.$store.getters['submits/flows'](this.pubid)
        if (!flows) flows = []
        // Set starter addtype and get countsubmits
        const filteredflows = []
        let countsubmits = 0
        for (const flow of flows) {
          const anysubmithidden = false
          if (!this.flowid || this.flowid===flow.id) filteredflows.push(flow)
          flow.addtype = false
          if (!this.submitid) {
            for (const accepting of flow.acceptings) {
              if (_.isNull(accepting.flowstatusId) && accepting.open) {
                const addstage = _.find(flow.stages, stage => { return stage.id === accepting.flowstageId })
                if (addstage) {
                  flow.addtype = addstage.name
                  flow.addid = addstage.id
                }
              }
            }
          }
          flow.filteredsubmits = []
          for (const submit of flow.submits) {
            if (!this.submitid || this.submitid === submit.id) flow.filteredsubmits.push(submit)
            if (!submit.visible) anysubmithidden = true
            // Find most recent status and what next stage is possible
            submit.status = 'Status not set'
            let statusid = false
            let cansubmitflowstageId = false
            if (submit.statuses.length > 0) {
              statusid = submit.statuses[submit.statuses.length - 1].flowstatusId
              const status = _.find(flow.statuses, status => { return status.id === statusid })
              if (status) {
                submit.status = status.status
                cansubmitflowstageId = status.cansubmitflowstageId
              }
            }
            console.log('Most recent status:', statusid, submit.status)
            for (const entry of submit.entries) {
              entry.stage = _.find(flow.stages, stage => { return stage.id === entry.flowstageId })
            }
            // If we've got a most-recent-status (which we should) then check that cansubmitflowstageId allowed
            if (statusid && cansubmitflowstageId) {
              for (const accepting of flow.acceptings) {
                if (accepting.flowstatusId == statusid) {
                  if (accepting.flowstageId !== cansubmitflowstageId) {
                    console.log('OOPS: accepting.flowstageId !== cansubmitflowstageId', accepting.flowstageId, cansubmitflowstageId)
                  } else {
                    if (!accepting.open) cansubmitflowstageId = false
                  }
                }
              }
            }
            if (cansubmitflowstageId) {
              const addstage = _.find(flow.stages, stage => { return stage.id === cansubmitflowstageId })
              if (addstage) {
                submit.addtype = addstage.name
                submit.addid = addstage.id
              }
            }
          }
          countsubmits += flow.submits.length
          flow.submitsallvisible = !anysubmithidden
        }
        this.noflows = flows.length === 0
        this.nowtavailable = !this.noflows && countsubmits === 0
        return filteredflows
      },
    },
    methods: {
      toggleFlowShow(flow) {
        for (const submit of flow.submits) {
          submit.visible = !flow.submitsallvisible
        }
        flow.submitsallvisible = !flow.submitsallvisible
      },
      toggleSubmitShow(submit) {
        submit.visible = !submit.visible
      },
      async deleteSubmit(submitid) {
        try {
          console.log('deleteSubmit',submitid)
          const OK = await this.$bvModal.msgBoxConfirm('Are you sure you want to delete this submission and all its entries?')
          if (!OK) return
          const deleted = await this.$api.submit.deleteSubmit(submitid)
          console.log('deleteSubmitted', deleted)
          if (!deleted) {
            await this.$bvModal.msgBoxOk('Could not delete this submission')
            return
          }
          await this.$bvModal.msgBoxOk('Submission deleted')
          await this.$bvModal.msgBoxOk('NEED TO REMOVE STATUS, REVIEWS, ETC???')
          this.$store.dispatch('submits/fetchpub', this.pubid)
        } catch (e) {
          this.error = e.message
        }
      },
      editSubmitName(submit) {
        this.newtitle = submit.name
        this.submitbeingedited = submit
        this.$bvModal.show('bv-modal-edit-submit-title')
      },
      okTitleEdited(bvModalEvt) {
        bvModalEvt.preventDefault()
        this.submitTitleEdited()
      },
      async submitTitleEdited() {
        try {
          const newtitle = this.newtitle.trim()
          if (newtitle.length === 0) return await this.$bvModal.msgBoxOk('No new title given!')

          const amended = await this.$api.submit.changeSubmitTitle(this.submitbeingedited, newtitle)
          if (!amended) return await this.$bvModal.msgBoxOk('Error changing title')
          this.$store.dispatch('submits/fetchpub', this.pubid)
          this.$nextTick(() => {
            this.$bvModal.hide('bv-modal-edit-submit-title')
          })
        } catch (e) {
          this.$bvModal.msgBoxOk('Error changing title: '+e.message)
        }
      },
    },
  }
</script>
<style>
  .status {
    font-weight: bold;
    color: green;
  }
</style>
