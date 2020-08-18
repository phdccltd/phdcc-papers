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
              <b-btn variant="link" @click="toggleSubmitShow(submit)" data-hello="brian">
                <v-icon v-if="submit.visible" name="minus-square" scale="2" />
                <v-icon v-if="!submit.visible" name="plus-square" scale="2" />
              </b-btn>

              {{ submit.id }}:
              <!--nuxt-link :to="'/panel/'+pubid+'/'+submit.id"-->
              {{ submit.name }}
              <!--/nuxt-link-->
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
            if( !submit.visible) anysubmithidden = true
            submit.status = 'Status not set'
            let statusid = false
            if (submit.statuses.length > 0) {
              statusid = submit.statuses[submit.statuses.length - 1].flowstatusId
              const status = _.find(flow.statuses, status => { return status.id === statusid })
              if (status) submit.status = status.status
            }
            for (const entry of submit.entries) {
              entry.stage = _.find(flow.stages, stage => { return stage.id === entry.flowstageId })
            }
            if (statusid) {
              for (const accepting of flow.acceptings) {
                if (accepting.flowstatusId == statusid && accepting.open) {
                  const addstage = _.find(flow.stages, stage => { return stage.id === accepting.flowstageId })
                  if (addstage) {
                    submit.addtype = addstage.name
                    submit.addid = addstage.id
                  }
                }
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
    },
  }
</script>
<style>
  .status {
    font-weight: bold;
    color: green;
  }
</style>
