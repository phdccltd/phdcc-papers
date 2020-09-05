<template>
  <!-- ADMIN STAGE ACCEPTING FOR PUBLICATION FLOW -->
  <!-- Access check: correctly fails as API returns error if not allowed -->
  <div>
    <b-alert v-if="fatalerror" variant="warning" :show="true">
      ERROR {{fatalerror}}
    </b-alert>
    <div v-else-if="!pub.isowner">
      You cannot administer this publication flow
    </div>
    <div v-else>
      <HelpAdminFlowAcceptings />
      <Messages :error="error" :message="message" />
      <div class="bg-yellow p-3">
        <strong>{{flow.name}}:</strong>
        <b-btn variant="outline-success" @click="startAddAccepting()">
          Add accepting
        </b-btn>
      </div>
      <b-list-group class="acceptings">
        <b-list-group-item v-for="(accepting, index) in acceptings" :key="index" class="accepting">
          <b-link @click="deleteAccepting(accepting)">
            <v-icon name="times-circle" scale="1" class="btn-outline-danger" />
          </b-link>
          {{accepting.flowstagename}} {{accepting.opentext}} {{ accepting.flowstatusname }}
          <b-btn variant="link" @click="startEditAccepting(accepting)">
            <v-icon name="edit" scale="1.5" class="btn-outline-warning" />
          </b-btn>
        </b-list-group-item>
      </b-list-group>
    </div>

    <b-modal id="bv-modal-accepting" size="xl" centered @ok="okAccepting">
      <template v-slot:modal-title>
        {{modaltitle}}
      </template>
      <form ref="form" @submit.stop.prevent>
        <b-form-group label="Stage"
                      label-for="stage"
                      label-cols-sm="2">
          <b-form-select id="stage"
                         :options="this.availablestages"
                         size="sm"
                         v-model="chosenstage"
                         style="width:auto;">
            <template v-slot:first>
              <b-form-select-option disabled value="0">Select a stage</b-form-select-option>
            </template>
          </b-form-select>
        </b-form-group>
      </form>
    </b-modal>
  </div>
</template>
<script>
  const _ = require('lodash/core')
  import HelpAdminFlowAcceptings from '~/components/HelpAdminFlowAcceptings'
  import Messages from '~/components/Messages'
  import { page } from '@/utils/phdcc'
  page.title = ''
  export default {
    middleware: 'authuser',
    components: { Messages, HelpAdminFlowAcceptings },
    data({ app, params, store }) {
      //console.log('_id data')
      return {
        error: '',
        message: '',
        modaltitle: 'UNSET',
        availablestages: [],
        availablestatuses: [],
        chosenstage: 0,
        chosenstatus: 0,
      }
    },
    async mounted() { // Client only
      this.error = ''
      this.message = ''
      this.$store.dispatch('pubs/fetch')
      this.$store.dispatch('submits/fetchpub', this.pubid)
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
        this.$store.commit("page/setTitleSuffix", 'ADMIN FLOW STATE')
        return pub
      },
      fatalerror() {
        const error1 = this.$store.getters['users/error']
        return error1
      },
      pubid() {
        return parseInt(this.$route.params.pubid)
      },
      flowid() {
        return parseInt(this.$route.params.flowid)
      },
      flow() {
        // Get flows and work out follow-on properties
        let flows = this.$store.getters['submits/flows'](this.pubid)
        if (!flows) return false
        const flow = _.find(flows, flow => { return flow.id === this.flowid })
        return flow
      },
      acceptings() {
        const flow = this.flow
        const acceptings = flow.acceptings
        this.availablestages = []
        for (const stage of flow.stages) {
          console.log(stage.name)
          this.availablestages.push({ value: stage.id, text: stage.name })
        }
        for (const accepting of acceptings) {
          accepting.opentext = accepting.open ? 'OPEN FOR SUBMISSIONS' : 'NOT OPEN FOR SUBMISSIONS'

          accepting.flowstagename = 'NOT-FOUND'
          const stage = _.find(flow.stages, stage => { return stage.id === accepting.flowstageId })
          if (stage) accepting.flowstagename = stage.name
          
          accepting.flowstatusname = ""
          if (accepting.flowstatusId) {
            const status = _.find(flow.statuses, status => { return status.id === accepting.flowstatusId })
            if (status) accepting.flowstatusname = 'IF AT STATUS '+status.status
            else accepting.flowstatusname = 'IF AT: STATUS NOT FOUND: ' + accepting.flowstatusId
          }
        }
        return acceptings
      },
    },
    methods: {
      /* ************************ */
      setError(msg) {
        this.error = msg
      },
      /* ************************ */
      setMessage(msg) {
        this.message = msg
      },
      /* ************************ */
      startAddAccepting() {
        this.modaltitle = 'Add accepting'
        this.availablestages = []
        this.chosenstage = 0
        this.chosenstatus = 0
        this.$bvModal.show('bv-modal-accepting')
      },
      /* ************************ */
      startEditAccepting(accepting) {
        this.modaltitle = 'Edit accepting'
        this.availablestages = []
        this.chosenstage = accepting.flowstageId
        this.chosenstatus = accepting.flowstatusId
        this.$bvModal.show('bv-modal-accepting')
      },
      /* ************************ */
      okAccepting() {
        bvModalEvt.preventDefault()
        try {
          this.$nextTick(() => {
            this.$bvModal.hide('bv-modal-accepting')
          })
        } catch (e) {
          this.$bvModal.msgBoxOk('Error adding accepting: ' + e.message)
        }
      },
      /* ************************ */
      deleteAccepting(accepting) {
        try {
          this.$bvModal.msgBoxOk('NOT IMPLEMENTED')
        } catch (e) {
          this.$bvModal.msgBoxOk('Error deleting accepting: ' + e.message)
        }
      },
    },
    /* ************************ */
    head() {
      return {
        title: page.title,
      }
    },
  }
</script>
