<template>
  <div>
    <!-- Main code to display submits etc for a publication, ie for all flows -->
    <!-- Displays all the submits that a user can see ie those they've written and those they can grade - or all for owners -->
    <div v-if="pub.isowner || issuper" class="ps-1 mt-1 mb-1">
      <strong>ADMIN</strong>
      <b-button variant="outline-danger" class="float-end" :to="'/panel/' + pubid + '/admin-setup'">Setup</b-button>
      <b-badge v-if="!pub.enabled" pill variant="danger" class="float-end m-2">DISABLED FOR USERS</b-badge>
      <b-button variant="outline-warning" @click="toggleShowAdminOptions()">Show/Hide admin options</b-button>
      <b-button v-if="showingadminoptions" variant="outline-success" :to="'/panel/' + pubid + '/admin-users'" class="ms-2">Users</b-button>
      <b-button v-if="showingadminoptions" variant="outline-success" :to="'/panel/' + pubid + '/admin-bulk'" class="ms-2">Bulk</b-button>
      <b-button v-if="showingadminoptions" variant="outline-success" :to="'/panel/' + pubid + '/admin-mail-templates'" class="ms-2">Mail
        templates
      </b-button>
      <b-button v-if="showingadminoptions" variant="outline-success" :to="'/panel/' + pubid + '/admin-mail'" class="ms-2">Send email</b-button>
      <b-button v-if="showingadminoptions" variant="outline-success" :to="'/panel/' + pubid + '/admin-downloads'" class="ms-2">Downloads
      </b-button>
    </div>
    <div class="ps-1">
      Your roles
      <strong v-if="issuper">SUPERADMIN</strong>
      <span v-for="myrole in pub.myroles">
        - {{ myrole.name }}
      </span>
    </div>
    <b-list-group class="flows">
      <b-list-group-item v-for="(flow, index) in flows" :key="index" class="flow">
        <h2 class="bg-yellow clearfix">
          <b-button variant="link" @click="toggleFlowShow(flow)">
            <v-icon v-if="flow.visible" icon="minus-square" size="2x" class="btn-outline-warning" />
            <v-icon v-if="!flow.visible" icon="plus-square" size="2x" class="btn-outline-warning" />
          </b-button>
          {{ flow.name }}
          <span v-for="flowaction in flow.actions">
            <b-button class="float-end me-2" variant="outline-success" :to="flowaction.route">{{ flowaction.name }}</b-button>
          </span>
          <b-button class="float-end me-2" v-if="pub.isowner && showingadminoptions" variant="outline-success"
            :to="'/panel/' + pubid + '/' + flow.id + '/admin-flow-acceptings'">Stage status</b-button>
        </h2>
        <b-list-group v-if="flow.visible" class="flows">
          <p class="m-1">{{ flow.description }}</p>
          <b-list-group-item v-for="(submit, index) in flow.filteredsubmits" :key="index" :class="'submit ' + (submit.ismine ? '' : 'submitnotmine')">
            <SubmitSummary :showtype="1" :pub="pub" :flow="flow" :submit="submit" :showingadminoptions="showingadminoptions" :editSubmit="editSubmit"
              :setError="setError" :setMessage="setMessage" />
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

    <client-only>
      <b-modal v-model="showEditSubmitQuick" id="modal-edit-submit" title="Edit submission title and author" size="lg" centered>
        <template #default>
          <form ref="form" @submit.stop.prevent>
            <b-form-group label="Title" label-for="new-title" invalid-feedback="Title is required">
              <b-form-input id="new-title" required v-model="newtitle"></b-form-input>
            </b-form-group>
            <b-form-group label="Author" label-for="newauthor">
              <b-form-select v-model="newauthor" :options="newauthoroptions"></b-form-select>
            </b-form-group>
          </form>
        </template>
        <template #footer>
          <b-button variant="outline-secondary" @click="hideEdited"> Cancel </b-button>
          <b-button variant="primary" @click="okEdited"> OK </b-button>
        </template>
      </b-modal>
    </client-only>
    <MessageBoxOK ref="okmsgbox" />
    <ConfirmModal ref="confirm" :title="confirmTitle" :message="confirmMessage" @confirm="confirmedOK" />
  </div>
</template>
  
<script lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'
import { usePubsStore } from '~/stores/pubs'
import { useSubmitsStore } from '~/stores/submits'
import SubmitSummary from '~/components/SubmitSummary.vue'
import _ from 'lodash/core'
import api from '~/api'

export default {
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
  setup() {
    const authStore = useAuthStore()
    const miscStore = useMiscStore()
    const pubsStore = usePubsStore()
    const submitsStore = useSubmitsStore()

    return { authStore, miscStore, pubsStore, submitsStore }
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
      showEditSubmitQuick: false,
      confirmTitle: '',
      confirmMessage: '',
      confirmOK: null,
    }
  },
  /*inject: {
      msgBoxOk: {
          default() {
              return () => {
                  console.log('no map')
              }
          }
      }
  },*/
  computed: {
    pubid() {
      const route = useRoute()
      return parseInt(route.params.pubid)
    },
    pub() {
      const pub = this.pubsStore.getPub(this.pubid)
      if (!pub) {
        this.setError('Invalid pubid')
        return false
      }
      // pub.isowner = true // Do this when testing faked API access restriction
      this.miscStore.set({ key: 'page-title', value: pub.name })
      return pub
    },
    flows() {
      //console.log('PUB flows', this.pubid)
      // Get flows and work out follow-on properties
      let flows = this.submitsStore.flows(this.pubid)
      if (!flows) flows = []
      // Set starter addtype and get countsubmits
      const filteredflows = []
      let countsubmits = 0
      for (const flow of flows) {
        //let anysubmithidden = false
        if (!this.flowid || this.flowid === flow.id) filteredflows.push(flow)

        flow.filteredsubmits = []
        for (const fsubmit of flow.submits) {
          const submit = this.submitsStore.submit(this.pubid, fsubmit.id)
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
    issuper() {
      return this.authStore.super
    },
    isowner() {
      return this.authStore.super
    },
  },
  methods: {
    toggleShowAdminOptions() {
      this.showingadminoptions = !this.showingadminoptions
    },
    toggleFlowShow(flow: any) {
      console.log('toggleFlowShow', flow.visible)
      flow.visible = !flow.visible
    },
    async editSubmit(submit: any) { // These three methods are also in \panel\_pubid\_flowid\_submitid\index.vue ie duplicated
      try {
        this.newauthoroptions = []
        const { pubusers } = await api.auth.getPubUsers(this.pubid)
        for (const user of pubusers.users) {
          this.newauthoroptions.push({ value: user.id, text: user.username })
        }
        this.newtitle = submit.name
        this.newauthor = submit.userId
        this.submitbeingedited = submit
        this.showEditSubmitQuick = true
      } catch (e) {
        console.log("editSubmit:", e.message)
      }
    },
    hideEdited() {
      this.showEditSubmitQuick = false
    },
    msgBoxOk(title: string) {
      this.waitForRef('okmsgbox', async () => {
        this.$refs.okmsgbox.show(title)
      })
    },
    startConfirm() {
      this.waitForRef('confirm', async () => {
        this.$refs.confirm.show()
      })
    },
    confirmedOK() {
      this.confirmOK();
    },
    okEdited() {
      try {
        const newtitle = this.newtitle.trim()
        if (newtitle.length === 0) return this.msgBoxOk('No new title given!')
        let newauthor = 0
        if (this.newauthor !== this.submitbeingedited.userId) {
          const prev = _.find(this.newauthoroptions, option => { return option.value === this.submitbeingedited.userId })
          const next = _.find(this.newauthoroptions, option => { return option.value === this.newauthor })
          this.confirmTitle = "Are you sure you want to change the author?"
          this.confirmMessage = `Change author from ${prev.text} to ${next.text}?`
          this.confirmOK = this.confirmedAuthorChange
          this.startConfirm();
        } else {
          this.confirmedAuthorChange()
        }
      } catch (e) {
        this.msgBoxOk('Error changing submit: ' + e.message)
      }
    },
    async confirmedAuthorChange() {
      console.log("confirmedAuthorChange")
      const newtitle = this.newtitle.trim()
      let newauthor = 0
      if (this.newauthor !== this.submitbeingedited.userId) {
        newauthor = this.newauthor
      }
      const amended = await api.submit.changeSubmitTitle(this.submitbeingedited, newtitle, newauthor)
      if (!amended) return this.msgBoxOk('Error changing submit')
      await this.submitsStore.fetchpub(this.pubid)
      this.$nextTick(() => {
        this.showEditSubmitQuick = false
        this.msgBoxOk('Submit changed')
      })
    },
    /*async deleteSubmit(submit) {
      console.log('deleteSubmit', submit.id)
      this.confirmTitle = "Are you sure you want to delete this submission and all its entries?"
      this.confirmMessage = submit.name
      this.confirmOK = this.confirmedDeleteSubmit
      this.startConfirm();
    },
    async confirmedDeleteSubmit(submit) {
      try {
        console.log('confirmedDeleteSubmit', submit.id)
        const deleted = await api.submit.deleteSubmit(submit.id)
        //console.log('deleteSubmitted', deleted)
        if (!deleted) {
          return this.msgBoxOk('Could not delete this submission')
        }
        await this.submitsStore.fetchpub(this.pubid)
        this.$nextTick(() => {
          this.msgBoxOk('Submission deleted')
        })
      } catch (e) {
        this.msgBoxOk('Error deleting submission: ' + e.message)
      }
    },*/
  },
}
</script>
<style>
.status {
  font-weight: bold;
  color: green;
}
</style>
  