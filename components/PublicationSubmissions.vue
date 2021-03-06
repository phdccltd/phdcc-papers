<template>
  <!-- Main code to display submits etc for a publication, ie for all flows -->
  <!-- Displays all the submits that a user can see ie those they've written and those they can grade - or all for owners -->
  <div>
    <div v-if="pub.isowner || $auth.user.super" class="pl-1 mt-1 mb-1">
      <strong>ADMIN</strong>
      <b-btn variant="outline-danger" class="float-right" :to="'/panel/'+pubid+'/admin-setup'">Setup</b-btn>
      <b-badge v-if="!pub.enabled" pill variant="danger" class="float-right m-2">DISABLED FOR USERS</b-badge>
      <b-btn variant="outline-warning" @click="toggleShowAdminOptions()">Show/Hide admin options</b-btn>
      <b-btn v-if="showingadminoptions" variant="outline-success" :to="'/panel/'+pubid+'/admin-users'" class="ml-2">Users</b-btn>
      <b-btn v-if="showingadminoptions" variant="outline-success" :to="'/panel/'+pubid+'/admin-bulk'" class="ml-2">Bulk</b-btn>
      <b-btn v-if="showingadminoptions" variant="outline-success" :to="'/panel/'+pubid+'/admin-mail-templates'" class="ml-2">Mail templates</b-btn>
      <b-btn v-if="showingadminoptions" variant="outline-success" :to="'/panel/'+pubid+'/admin-mail'" class="ml-2">Send email</b-btn>
      <b-btn v-if="showingadminoptions" variant="outline-success" :to="'/panel/'+pubid+'/admin-downloads'" class="ml-2">Downloads</b-btn>
    </div>
    <div class="pl-1">
      Your roles
      <strong v-if="$auth.user.super">SUPERADMIN</strong>
      <span v-for="myrole in pub.myroles">
        - {{myrole.name}}
      </span>
    </div>
    <b-list-group class="flows">
      <b-list-group-item v-for="(flow, index) in flows" :key="index" class="flow">
        <h2 class="bg-yellow clearfix">
          <b-btn variant="link" @click="toggleFlowShow(flow)">
            <v-icon v-if="flow.visible" name="minus-square" scale="2" class="btn-outline-warning" />
            <v-icon v-if="!flow.visible" name="plus-square" scale="2" class="btn-outline-warning" />
          </b-btn>
          {{ flow.name }}
          <span v-for="flowaction in flow.actions">
            <b-btn class="float-right mr-2" variant="outline-success" :to="flowaction.route">{{flowaction.name}}</b-btn>
          </span>
          <b-btn class="float-right mr-2" v-if="pub.isowner && showingadminoptions" variant="outline-success" :to="'/panel/'+pubid+'/'+flow.id+'/admin-flow-acceptings'">Stage status</b-btn>
        </h2>
        <b-list-group v-if="flow.visible" class="flows">
          <p class="m-1">{{flow.description}}</p>
          <b-list-group-item v-for="(submit, index) in flow.filteredsubmits" :key="index" :class="'submit ' + (submit.ismine?'':'submitnotmine')">
            <SubmitSummary :showtype="1" :pub="pub" :flow="flow" :submit="submit" :showingadminoptions="showingadminoptions" :editSubmit="editSubmit" :setError="setError" :setMessage="setMessage" />
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

    <b-modal id="bv-modal-edit-submit" centered @ok="okEdited">
      <template v-slot:modal-title>
        Edit submission title and author
      </template>
      <form ref="form" @submit.stop.prevent>
        <b-form-group label="Title"
                      label-for="new-title"
                      invalid-feedback="Title is required">
          <b-form-input id="new-title" required v-model="newtitle"></b-form-input>
        </b-form-group>
        <b-form-group label="Author"
                      label-for="newauthor">
          <b-form-select v-model="newauthor" :options="newauthoroptions"></b-form-select>
        </b-form-group>
      </form>
    </b-modal>

  </div>
</template>
<script>
  import SubmitSummary from '~/components/SubmitSummary'
  import PaperDate from '~/components/PaperDate'
  const _ = require('lodash/core')
  import { page } from '@/utils/page'
  import { BBadge } from 'bootstrap-vue'

  export default {
    components: { SubmitSummary, PaperDate, BBadge },
    mixins: [],
    props: {
      flowid: {
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
        showingadminoptions: false,
        submitbeingedited: false,
        newtitle: '',
        newauthor: 0,
        newauthoroptions: [],
      }
    },
    computed: {
      pubid() {
        return parseInt(this.$route.params.pubid)
      },
      pub() {
        const pub = this.$store.getters['pubs/getPub'](this.pubid)
        if (!pub) {
          this.setError('Invalid pubid')
          return false
        }
        // pub.isowner = true // Do this when testing faked API access restriction
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
          //let anysubmithidden = false
          if (!this.flowid || this.flowid === flow.id) filteredflows.push(flow)

          flow.filteredsubmits = []
          for (const fsubmit of flow.submits) {
            const submit = this.$store.getters['submits/submit'](this.pubid, fsubmit.id)
            flow.filteredsubmits.push(submit)
            //if (!submit.visible) anysubmithidden = true

            for (const entry of submit.entries) {
              entry.stage = _.find(flow.stages, stage => { return stage.id === entry.flowstageId })
            }
          }
          countsubmits += flow.submits.length
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
        console.log('toggleFlowShow', flow.visible)
        flow.visible = !flow.visible
      },
      async editSubmit(submit) { // These three methods are also in \panel\_pubid\_flowid\_submitid\index.vue ie duplicated
        this.newauthoroptions = []
        const { pubusers } = await this.$api.user.getPubUsers(this.pubid)
        for (const user of pubusers.users) {
          this.newauthoroptions.push({ value: user.id, text: user.username })
        }
        this.newtitle = submit.name
        this.newauthor = submit.userId
        this.submitbeingedited = submit
        this.$bvModal.show('bv-modal-edit-submit')
      },
      okEdited(bvModalEvt) {
        bvModalEvt.preventDefault()
        this.doEditSubmit()
      },
      async doEditSubmit() {
        try {
          const newtitle = this.newtitle.trim()
          if (newtitle.length === 0) return await this.$bvModal.msgBoxOk('No new title given!')
          let newauthor = 0
          if (this.newauthor !== this.submitbeingedited.userId) {
            const OK = await this.$bvModal.msgBoxConfirm('Are you sure you want to change the author?')
            if (!OK) return
            newauthor = this.newauthor
          }
          const amended = await this.$api.submit.changeSubmitTitle(this.submitbeingedited, newtitle, newauthor)
          if (!amended) return await this.$bvModal.msgBoxOk('Error changing submit')
          this.$store.dispatch('submits/fetchpub', this.pubid)
          this.$nextTick(() => {
            this.$bvModal.hide('bv-modal-edit-submit')
            this.$bvModal.msgBoxOk('Submit changed')
          })
        } catch (e) {
          await this.$bvModal.msgBoxOk('Error changing submit: ' + e.message)
        }
      },
      async deleteSubmit(submit) {
        try {
          console.log('deleteSubmit',submit.id)
          const OK = await this.$bvModal.msgBoxConfirm('Are you sure you want to delete this submission and all its entries?', { title: submit.name })
          if (!OK) return
          const deleted = await this.$api.submit.deleteSubmit(submit.id)
          //console.log('deleteSubmitted', deleted)
          if (!deleted) {
            await this.$bvModal.msgBoxOk('Could not delete this submission')
            return
          }
          await this.$bvModal.msgBoxOk('Submission deleted')
          this.$store.dispatch('submits/fetchpub', this.pubid)
        } catch (e) {
          await this.$bvModal.msgBoxOk('Error deleting submission: ' + e.message)
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
