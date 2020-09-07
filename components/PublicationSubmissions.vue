<template>
  <!-- Main code to display all user's submits etc for a publication, ie for all flows -->
  <!-- Seems to have submitid optional param but now never called that way -->
  <div>
    <div v-if="pub.isowner" class="pl-1 mt-1 mb-1">
      <strong>ADMIN</strong>
      <b-btn variant="outline-warning" @click="toggleShowAdminOptions()">Show/Hide admin options</b-btn>
      <b-btn v-if="showingadminoptions" variant="outline-success" :to="'/panel/'+pubid+'/admin-users'" class="ml-2">Users</b-btn>
    </div>
    <div class="pl-1">
      Roles
      <strong v-if="$auth.user.super">SUPERADMIN</strong>
      <span v-for="myrole in pub.myroles">
        - {{myrole.name}}
      </span>
    </div>
    <b-list-group class="flows">
      <b-list-group-item v-for="(flow, index) in flows" :key="index" class="flow">
        <h2 v-bind:class="submitid?'':'bg-yellow'">
          <b-btn variant="link" @click="toggleFlowShow(flow)">
            <v-icon v-if="flow.submitsallvisible" name="minus-square" scale="2" class="btn-outline-warning" />
            <v-icon v-if="!flow.submitsallvisible" name="plus-square" scale="2" class="btn-outline-warning" />
          </b-btn>
          {{ flow.name }}
          <span v-for="flowaction in flow.actions">
            <b-btn class="float-right" variant="success" :to="flowaction.route">{{flowaction.name}}</b-btn>
          </span>
          <b-btn class="float-right mr-2" v-if="pub.isowner && showingadminoptions" variant="outline-success" :to="'/panel/'+pubid+'/'+flow.id+'/admin-flow-mail-templates'">Mail templates</b-btn>
          <b-btn class="float-right mr-2" v-if="pub.isowner && showingadminoptions" variant="outline-success" :to="'/panel/'+pubid+'/'+flow.id+'/admin-flow-acceptings'">Stage status</b-btn>
        </h2>
        <b-list-group class="flows">
          <b-list-group-item v-for="(submit, index) in flow.filteredsubmits" :key="index" class="submit">
            <h3 class="publist-submit-h3">
              <b-btn variant="link" @click="toggleSubmitShow(submit)" style="margin-left: -0.6rem;">
                <v-icon v-if="submit.visible" name="minus-square" scale="2" />
                <v-icon v-if="!submit.visible" name="plus-square" scale="2" />
              </b-btn>
              <b-btn v-if="showingadminoptions" variant="outline-danger" class="float-right" @click="deleteSubmit(submit)">
                Delete
              </b-btn>

              <b-link @click="toggleSubmitShow(submit)">
                {{ submit.id }}:
                {{ submit.name }}
              </b-link>
              <b-btn v-if="showingadminoptions" variant="link" @click="editSubmitName(submit)">
                <v-icon name="edit" scale="1.5" class="btn-outline-warning" />
              </b-btn>
            </h3>
            <div class="publist-current-status">
              <PaperDate :dt="submit.dtstatus" />
              <span class="status">{{ submit.status}}</span>
              <b-btn v-if="submit.addtype" variant="success" class="float-right" :to="'/panel/'+pubid+'/'+flow.id+'/'+submit.id+'/add/'+submit.addid">Add {{submit.addtype}}</b-btn>
              <br />
              <span v-for="submitaction in submit.actions">
                <b-btn class="float-right" variant="success">{{submitaction.name}}</b-btn>
                {{submitaction}}
              </span>
            </div>
            <b-container v-if="submit.visible">
              <b-row no-gutters>
                <b-col sm="6">
                  <div v-if="admin">
                    <form ref="form" @submit.stop.prevent>
                      <b-form-select v-model="submit.newstatusid" :options="flow.newstatuses" size="sm" style="width:auto;"></b-form-select>
                      <b-btn variant="outline-success" @click="addSubmitStatus(flow,submit)">Add status</b-btn>
                    </form>
                    <div v-for="(submitstatus, index) in submit.statuses" :key="index">
                      <b-link @click="deleteSubmitStatus(submitstatus)">
                        <v-icon name="times-circle" scale="1" class="btn-outline-danger" />
                      </b-link>
                      <PaperDate :dt="submitstatus.dt" />
                      <span class="status">{{ submitstatus.status }}</span>
                    </div>
                    <div v-if="submit.statuses.length===0">
                      No statuses set
                    </div>
                  </div>
                </b-col>
                <b-col sm="6">
                  <b-list-group class="entries">
                    <b-list-group-item v-for="(entry, index) in submit.entries" :key="index" class="entry">
                      <PaperDate :dt="entry.dt" />
                      <b-btn variant="outline-success" :to="'/panel/'+pubid+'/'+flow.id+'/'+submit.id+'/'+entry.id">
                        {{entry.stage.name}}
                      </b-btn>
                    </b-list-group-item>
                  </b-list-group>
                </b-col>
              </b-row>
            </b-container>
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
      <form ref="form" @submit.stop.prevent>
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
        submitbeingedited: false,
        showingadminoptions: false,
        newtitle: '',
        admin: true,
      }
    },
    computed: {
      pub() {
        const pub = this.$store.getters['pubs/getPub'](this.pubid)
        if (!pub) {
          setError('Invalid pubid')
          return false
        }
        page.title = pub.name
        document.title = pub.name
        this.$store.commit("page/setTitle", page.title)
        return pub
      },
      flows() {
        //console.log('PUB flows', this.pubid)

        // Get flows and work out follow-on properties
        let flows = this.$store.getters['submits/flows'](this.pubid)
        if (!flows) flows = []
        // Set starter addtype and get countsubmits
        const filteredflows = []
        let countsubmits = 0
        for (const flow of flows) {
          const anysubmithidden = false
          if (!this.flowid || this.flowid === flow.id) filteredflows.push(flow)
          flow.newstatuses = []

          for (const flowstatus of flow.statuses) {
            flow.newstatuses.push({ value: flowstatus.id, text: flowstatus.status })
          }

          flow.filteredsubmits = []
          for (const submit of flow.submits) {
            if (!this.submitid || this.submitid === submit.id) flow.filteredsubmits.push(submit)
            if (!submit.visible) anysubmithidden = true

            // Find most recent status and what next stage is possible // CODE ALSO IN store/submits.js - submit(state)
            // TOD: When only ones visibletoauthor returned in API "GET submits for publication" then simplify here
            submit.status = 'Status not set'
            submit.dtstatus = null
            submit.newstatusid = null
            let statusid = false
            let cansubmitflowstageId = false
            let foundvisible = false
            for (const submitstatus of submit.statuses) {
              submitstatus.status = 'Unknown'
              const flowstatus = _.find(flow.statuses, flowstatus => { return flowstatus.id === submitstatus.flowstatusId })
              if (flowstatus) {
                submitstatus.status = flowstatus.status
                if (!foundvisible && flowstatus.visibletoauthor) {
                  statusid = flowstatus.id
                  submit.status = flowstatus.status
                  submit.dtstatus = submitstatus.dt
                  cansubmitflowstageId = flowstatus.cansubmitflowstageId
                  foundvisible = true
                }
              }
            }

            //console.log('Most recent status:', statusid, submit.status)
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
      toggleShowAdminOptions() {
        this.showingadminoptions = !this.showingadminoptions
      },
      toggleFlowShow(flow) {
        for (const submit of flow.submits) {
          submit.visible = !flow.submitsallvisible
        }
        flow.submitsallvisible = !flow.submitsallvisible
      },
      toggleSubmitShow(submit) {
        submit.visible = !submit.visible
      },
      async deleteSubmit(submit) {
        try {
          console.log('deleteSubmit',submit.id)
          const OK = await this.$bvModal.msgBoxConfirm('Are you sure you want to delete this submission and all its entries?', { title: submit.name })
          if (!OK) return
          const deleted = await this.$api.submit.deleteSubmit(submit.id)
          console.log('deleteSubmitted', deleted)
          if (!deleted) {
            await this.$bvModal.msgBoxOk('Could not delete this submission')
            return
          }
          this.$bvToast.toast('Submission deleted', { toaster: 'b-toaster-top-center', variant: 'success', })
          await this.$bvModal.msgBoxOk('Submission deleted')
          await this.$bvModal.msgBoxOk('NEED TO REMOVE REVIEWS, ETC???')
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
          this.$bvToast.toast('Title edited', { toaster: 'b-toaster-top-center', variant: 'success', })
          this.$store.dispatch('submits/fetchpub', this.pubid)
          this.$nextTick(() => {
            this.$bvModal.hide('bv-modal-edit-submit-title')
          })
        } catch (e) {
          this.$bvModal.msgBoxOk('Error changing title: '+e.message)
        }
      },
      async deleteSubmitStatus(submitstatus) {
        try {
          //console.log('deleteSubmitStatus', submitstatus.id)
          if( !await this.$bvModal.msgBoxConfirm('Are you sure you want to delete this status?', { title: submitstatus.status })) return
          const OK = await this.$api.submit.deleteSubmitStatus(submitstatus.id)
          if (!OK) return await this.$bvModal.msgBoxOk('Error deleting status')
          this.$bvToast.toast('Status deleted', { toaster: 'b-toaster-top-center', variant: 'success', })
          this.$store.dispatch('submits/fetchpub', this.pubid)
        } catch (e) {
          this.$bvModal.msgBoxOk('Error deleting status: ' + e.message)
        }
      },
      async addSubmitStatus(flow,submit) {
        try {
          console.log('addSubmitStatus', submit.id, flow.id, submit.newstatusid)
          if (!submit.newstatusid) return await this.$bvModal.msgBoxOk('Please choose a new status')
          const flowstatus = _.find(flow.statuses, flowstatus => { return flowstatus.id === submit.newstatusid })
          if (!flowstatus) return await this.$bvModal.msgBoxOk('Could not find flowstatus for ' + submit.newstatusid)
          if (!await this.$bvModal.msgBoxConfirm('Adding this status will send any relevant emails. OK?', { title: flowstatus.status })) return
          const submitstatus = await this.$api.submit.addSubmitStatus(submit.id, submit.newstatusid)
          if (!submitstatus) return await this.$bvModal.msgBoxOk('Error adding status')
          this.$bvToast.toast('Status added', { toaster: 'b-toaster-top-center', variant: 'success', })
          submit.newstatusid = null // TODO This doesn't work ie status shows as selected when it is actually reset to null by following:
          this.$store.dispatch('submits/fetchpub', this.pubid)
        } catch (e) {
          this.$bvModal.msgBoxOk('Error adding status: ' + e.message)
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
