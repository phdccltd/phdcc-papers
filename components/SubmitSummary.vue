<template>
  <div>
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
      {{submit.user}}
      <b-btn v-if="showingadminoptions" variant="link" @click="editSubmitName(submit)">
        <v-icon name="edit" scale="1.5" class="btn-outline-warning" />
      </b-btn>
    </h3>
    <div class="publist-current-status clearfix">
      <PaperDate :dt="submit.dtstatus" />
      <span class="status">{{ submit.status }}</span>
      <span v-for="submitaction in submit.actions">
        <b-btn class="float-right" variant="success" :to="submitaction.route">{{submitaction.name}}</b-btn>
      </span>
    </div>

    <b-container v-if="submit.visible">
      <b-row no-gutters>
        <b-col sm="6">
          <div v-if="pub.isowner">
            <form ref="form" @submit.stop.prevent>
              <b-form-select v-model="submit.newstatusid" :options="newstatusoptions" size="sm" style="width:auto;"></b-form-select>
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

      <b-row>
        <b-col sm="6">
          <h4 class="publist-submit-h3">
            Grading
          </h4>
          <div v-for="flowgrade in flow.flowgrades">
            <strong>{{flowgrade.id}} {{flowgrade.name}}</strong>
            <div v-for="grading in filteredgradings(submit.gradings,flowgrade)">
              {{grading.flowgradescoreId}} <strong>{{grading.score}}</strong> {{grading.comment}} {{grading.username}} {{grading.lead}}
            </div>

          </div>
        </b-col>
        <b-col sm="6" v-if="pub.isowner">
          <h4 class="publist-submit-h3">
            Reviewers
          </h4>
          <div v-for="reviewer in submit.reviewers">
            {{reviewer.id}} {{reviewer.username}} {{reviewer.lead}}
          </div>
        </b-col>
      </b-row>

    </b-container>

  </div>
</template>
<script>
  import PaperDate from '~/components/PaperDate'
  const _ = require('lodash/core')

  export default {
    components: { PaperDate, },
    props: {
      pubid: {
        type: Number,
        required: true,
      },
      pub: {
        required: true,
      },
      flow: {
        required: true,
      },
      submit: {
        required: true,
      },
      showingadminoptions: {
        type: Boolean,
        required: true,
      },
      editSubmitName: {
        type: Function,
      },
    },
    data: function () {
      return {
      }
    },
    computed: {
      newstatusoptions() {
        const options = []
        for (const flowstatus of this.flow.statuses) {
          options.push({ value: flowstatus.id, text: flowstatus.status })
        }
        return options
      },
    },
    methods: {
      filteredgradings(gradings, flowgrade) {
        const gradingstoshow = []
        for (const grading of gradings) {
          if (grading.flowgradeId === flowgrade.id) {
            const flowgradescore = _.find(flowgrade.scores, (score) => { return score.id === grading.flowgradescoreId })
            grading.score = flowgradescore ? flowgradescore.name : 'Bad' + grading.flowgradescoreId
            gradingstoshow.push(grading)
          }
        }
        return gradingstoshow
      },
      toggleSubmitShow(submit) {
        submit.visible = !submit.visible
      },
      async deleteSubmit(submit) {
        try {
          console.log('deleteSubmit', submit.id)
          const OK = await this.$bvModal.msgBoxConfirm('Are you sure you want to delete this submission and all its entries?', { title: submit.name })
          if (!OK) return
          const deleted = await this.$api.submit.deleteSubmit(submit.id)
          //console.log('deleteSubmitted', deleted)
          if (!deleted) {
            await this.$bvModal.msgBoxOk('Could not delete this submission')
            return
          }
          //this.$bvToast.toast('Submission deleted', { toaster: 'b-toaster-top-center', variant: 'success', })
          await this.$bvModal.msgBoxOk('Submission deleted')
          await this.$bvModal.msgBoxOk('NEED TO REMOVE REVIEWS, ETC???')
          this.$store.dispatch('submits/fetchpub', this.pubid)
        } catch (e) {
          this.$bvModal.msgBoxOk('Error deleting submission: ' + e.message)
        }
      },
      async deleteSubmitStatus(submitstatus) {
        try {
          //console.log('deleteSubmitStatus', submitstatus.id)
          if (!await this.$bvModal.msgBoxConfirm('Are you sure you want to delete this status?', { title: submitstatus.status })) return
          const OK = await this.$api.submit.deleteSubmitStatus(submitstatus.id)
          if (!OK) return await this.$bvModal.msgBoxOk('Error deleting status')
          this.$bvToast.toast('Status deleted', { toaster: 'b-toaster-top-center', variant: 'success', })
          this.$store.dispatch('submits/fetchpub', this.pubid)
        } catch (e) {
          this.$bvModal.msgBoxOk('Error deleting status: ' + e.message)
        }
      },
      async addSubmitStatus(flow, submit) {
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
</style>
