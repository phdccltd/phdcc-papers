<template>
  <div>
    <!--  showtype  bit mask  0x1 top level   Show 'needed'
                              0x2 submit      Show 'needed'
                              0x4 entry       Show 'add grading'
    -->
    <div v-if="submit && flow">
      <div v-if="showtype == 1">
        <h3 class="publist-submit-h3">
          <b-button v-if="showingadminoptions" variant="outline-danger" class="float-end" @click="deleteSubmit(submit)">
            Delete
          </b-button>
          <nuxt-link :to="'/panel/' + pubid + '/' + flow.id + '/' + submit.id">
            {{ submit.id }}:
            {{ submit.name }}
          </nuxt-link>
          {{ submit.user }}
          <b-button v-if="showingadminoptions" variant="link" @click="editSubmit(submit)">
            <v-icon icon="edit" class="btn-outline-warning" />
          </b-button>
        </h3>
        <div class="publist-current-status clearfix">
          Status:
          <PaperDate :dt="submit.dtstatus" />
          <span class="status">{{ submit.status }}</span>
          <span v-for="submitaction in submit.actions" :key="submitaction.id">
            <b-button v-if="showaction(submitaction)" class="float-end ms-1 me-1" variant="success" :to="submitaction.route">
              {{ submitaction.name }}
            </b-button>
          </span>
          <div class="float-end">
            <div v-for="actiondone in submit.actionsdone" :key="actiondone.id" class="actiondone">{{ actiondone.name }}</div>
            <div v-if="pub.isowner && submit.owneradvice" class="actiondone">{{ submit.owneradvice }}</div>
          </div>
        </div>
      </div>
      <div v-else class="border rounded border-black">
        <h2 class="bg-yellow p-2">
          <b-button v-if="showtype == 4" variant="link" @click="toggleSubmitShow()" style="margin-left: -0.6rem;">
            <v-icon v-if="visible" icon="minus-square" size="2x" />
            <v-icon v-if="!visible" icon="plus-square" size="2x" />
          </b-button>
          <b-button v-if="showingadminoptions" variant="outline-danger" class="float-end" @click="deleteSubmit(submit)">
            Delete
          </b-button>

          <nuxt-link v-if="showtype == 4" :to="'/panel/' + pubid + '/' + flow.id + '/' + submit.id">
            {{ submit.id }}:
            {{ submit.name }}
          </nuxt-link>
          <span v-else>
            {{ submit.id }}:
            {{ submit.name }}
          </span>
          {{ submit.user }}
          <b-button v-if="showingadminoptions" variant="link" @click="editSubmit(submit)">
            <v-icon icon="edit" class="btn-outline-warning" />
          </b-button>
        </h2>
        <div class="publist-current-status clearfix">
          <PaperDate :dt="submit.dtstatus" />
          <span class="status">{{ submit.status }}</span>
          <span v-for="submitaction in submit.actions" :key="submitaction.id">
            <b-button v-if="showactiongrade(submitaction)" class="float-end ms-1 me-1" variant="success" @click="enterGrading(submit, submitaction)">
              {{ submitaction.gradename }}
            </b-button>
            <b-button v-if="showaction(submitaction)" class="float-end ms-1 me-1" variant="success" :to="submitaction.route">
              {{ submitaction.name }}
            </b-button>
          </span>
          <div v-if="pub.isowner && submit.owneradvice" class="actiondone float-end me-2">{{ submit.owneradvice }}</div>
        </div>

        <b-container v-if="visible">
          <div class="border rounded border-black mt-1 p-1">
            <b-row>
              <b-col sm="6">
                <h3 class="publist-submit-h3">
                  <b-link @click.prevent="toggleShowSubmissions()">Submissions</b-link>
                </h3>
              </b-col>
              <b-col sm="6" v-if="showsubmissions">
                <b-list-group class="entries">
                  <b-list-group-item v-for="entry in submit.entries" :key="entry.id" class="entry">
                    <PaperDate :dt="entry.dt" />
                    <b-button variant="outline-success" :to="'/panel/' + pubid + '/' + flow.id + '/' + submit.id + '/' + entry.id">
                      {{ entry.stage.name }}
                    </b-button>
                  </b-list-group-item>
                </b-list-group>
              </b-col>
            </b-row>
          </div>
          <div v-if="pub.isowner" class="border rounded border-black mt-1 p-1">
            <b-row>
              <b-col sm="6">
                <h3 class="publist-submit-h3">
                  <b-link @click.prevent="toggleShowStatuses()">Statuses</b-link>
                </h3>
                <form v-if="showstatuses" ref="form" @submit.stop.prevent>
                  <b-form-select v-model="submit.newstatusid" :options="newstatusoptions" size="sm" style="width:auto;"></b-form-select>
                  <b-button variant="outline-success" @click="addSubmitStatus(flow, submit)">Add status</b-button>
                </form>
              </b-col>
              <b-col sm="6" v-if="showstatuses">
                <div v-for="submitstatus in submit.statuses" :key="submitstatus.id">
                  <b-link @click.prevent="deleteSubmitStatus(submitstatus)">
                    <v-icon icon="times-circle" class="btn-outline-danger" />
                  </b-link>
                  <PaperDate :dt="submitstatus.dt" />
                  <span class="status">{{ submitstatus.status }}</span>
                </div>
                <div v-if="submit.statuses.length === 0">
                  No statuses set
                </div>
              </b-col>
            </b-row>
          </div>

          <div v-if="showReviewersSection()" class="border rounded border-black mt-1">
            <b-row>
              <b-col sm="6">
                <h3 class="publist-submit-h3">
                  <b-link @click.prevent="toggleShowReviewers()">Reviewers</b-link>
                </h3>
                <form ref="form" @submit.stop.prevent v-if="showreviewers && pub.isowner">
                  <b-form-select v-model="submit.newreviewerid" :options="newrevieweroptions" size="sm" style="width:auto;"></b-form-select>
                  <b-button variant="outline-success" @click="addReviewer(submit)">Add reviewer</b-button>
                </form>
              </b-col>
              <b-col sm="6" v-if="showreviewers">
                <div v-for="reviewer in submit.reviewers" :key="reviewer.id">
                  <b-link v-if="pub.isowner" @click.prevent="removeReviewer(submit, reviewer)">
                    <v-icon icon="times-circle" class="btn-outline-danger" />
                  </b-link>
                  {{ reviewer.username }} {{ reviewer.lead ? '(Lead)' : '' }}
                  <v-icon v-for="grading in gradingicons(reviewer)" :key="grading.id" icon="check-circle" :color="grading.colour"
                  :title="grading.name" class="me-1" />
                  <v-icon v-for="sentreminder in reviewer.sentreminders" :key="sentreminder.id" icon="envelope" color="pink"
                  :title="sentreminder.dt" class="me-1" />
                </div>
              </b-col>
            </b-row>
          </div>
          <div class="border rounded border-black mt-1 p-1">
            <h3 class="publist-submit-h3 mb-1">
              <b-link @click.prevent="toggleShowGradings()">Reviews</b-link>
            </h3>
            <b-list-group v-if="showgradings" class="gradings">
              <b-list-group-item v-for="flowgrade in filteredflowgrades()" :key="flowgrade.id" class="grading p-2">
                <h4>
                  <b-link @click.prevent="toggleSubGradings(flowgrade)">{{ flowgrade.name }}</b-link>
                  - {{ filteredgradings(submit.gradings, flowgrade).length }}
                </h4>
                <b-list-group v-if="flowgrade.visible">
                  <b-list-group-item v-for="grading in filteredgradings(submit.gradings, flowgrade)" :key="grading.id" class="p-2">
                    <Grading :pub="pub" :flowgrade="flowgrade" :grading="grading" :submit="submit" :addReviewer="addReviewer" />
                  </b-list-group-item>
                </b-list-group>
                <div v-if="pub.isowner">
                  <h4>
                    <b-link @click.prevent="toggleSubGradingSummary(flowgrade)">{{ flowgrade.name }} summary</b-link>
                  </h4>
                  <b-list-group v-if="flowgrade.summary">
                    <b-list-group-item class="p-2">
                      <GradingSummary :flowgrade="flowgrade" :submit="submit" />
                    </b-list-group-item>
                  </b-list-group>
                </div>
              </b-list-group-item>
              <div v-if="filteredflowgrades().length === 0">
                No reviews
              </div>
            </b-list-group>
          </div>
        </b-container>
      </div>
    </div>

    <b-modal v-model="showGradingModal" id="bv-modal-grading" centered no-close-on-backdrop>
      <template #header>
        {{ modaltitle }}
      </template>
      <template #default>
        <form ref="form" @submit.stop.prevent>
          <b-form-row>
            <b-col sm="3">
              <b-button v-if="helplinktext && helplink" variant="outline-success" :href="helplink" target="_blank">{{ helplinktext }}</b-button>
            </b-col>
            <b-col sm="9">
              {{ helptext }}
            </b-col>
          </b-form-row>
          <b-form-group label="Decision" label-for="decision" label-cols-sm="3" :state="true">
            <b-form-select v-model="decision" :options="decisionoptions" value-field="id" text-field="name" :select-size="4">
            </b-form-select>
          </b-form-group>
          <b-form-group v-if="cancomment" label="Comment" label-for="comment" label-cols-sm="3" :state="true">
            <b-form-textarea id="comment" v-model="comment" rows="10" max-rows="100" style="overflow-y: auto;">
            </b-form-textarea>
          </b-form-group>
          <b-form-group v-if="canopttoreview" label-cols-sm="3" :state="true">
            <b-form-checkbox v-model="canreview" name="checkbox-1" value="true" unchecked-value="false">
              I can review
            </b-form-checkbox>
          </b-form-group>
        </form>
      </template>
      <template #footer>
        <b-button variant="outline-secondary" @click="hideGrading"> Cancel </b-button>
        <b-button variant="primary" @click="okGrading"> OK </b-button>
      </template>
    </b-modal>
    <MessageBoxOK ref="okmsgbox" />
    <ConfirmModal ref="confirm" :title="confirmTitle" :message="confirmMessage" :cancelText="confirmCancelText" :confirmText="confirmOKText"
      @confirm="confirmedOK" @cancel="cancelConfirm" />
  </div>
</template> 

<script lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'
import { usePubsStore } from '~/stores/pubs'
import { useSubmitsStore } from '~/stores/submits'

import _ from 'lodash/core'
import api from '~/api'
import modalBoxes from '@/mixins/modalBoxes'

export default {
  mixins: [modalBoxes],
  props: {
    showtype: {
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
    editSubmit: {
      type: Function,
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
      visible: true,
      showsubmissions: true,
      showreviewers: true,
      showstatuses: true,
      showgradings: true,
      submitaction: null,
      helptext: false,
      helplinktext: false,
      helplink: false,
      decision: 0,
      decisionoptions: [],
      cancomment: false,
      comment: '',
      canopttoreview: false,
      canreview: false,
      flowgradeid: 0,
      confirmsubmit: null,
      confirmreviewer: null,
      confirmsubmitstatus: null,
      showGradingModal: false,
      modaltitle: 'GGG',
    }
  },
  mounted() {
    if (this.showtype == 4) this.visible = false
  },
  computed: {
    pubid() {
      const route = useRoute()
      return parseInt(route.params.pubid)
    },
    newstatusoptions() {
      const options = []
      if( !this.flow) return options
      for (const flowstatus of this.flow.statuses) {
        options.push({ value: flowstatus.id, text: flowstatus.status })
      }
      return options
    },
    newrevieweroptions() {
      const options = []
      for (const reviewer of this.pub.reviewers) {
        const already = _.find(this.submit.reviewers, _already => { return _already.userId === reviewer.id })
        if (!already) {
          options.push({ value: reviewer.id, text: reviewer.name + ' - ' + reviewer.roles })
        }
      }
      options.sort(function(a, b){
        return a.text.localeCompare(b.text)
      })
      return options
    },
  },
  methods: {
    gradingicons(reviewer) {
      const flowgrades = this.flow.flowgrades
      const gradingicons = []
      for (const grading of this.submit.gradings) {
        if (grading.userId === reviewer.userId) {
          const flowgrade = _.find(flowgrades, _flowgrade => { return grading.flowgradeId === _flowgrade.id })
          gradingicons.push({ id: grading.id, name: flowgrade ? flowgrade.name : '', colour: flowgrade ? flowgrade.tickcolour : 'green' })
        }
      }
      return gradingicons
    },
    filteredflowgrades() {
      const flowgradestoshow = []
      for (const flowgrade of this.flow.flowgrades) {
        // If we've been given some gradings, then it must be OK to show them
        const anygradings = _.find(this.submit.gradings, (grading) => { return grading.flowgradeId === flowgrade.id })
        if (anygradings) {
          flowgradestoshow.push(flowgrade)
        }
      }
      return flowgradestoshow
    },
    filteredgradings(gradings, flowgrade) {
      const gradingstoshow = []
      for (const grading of gradings) {
        if (grading.flowgradeId === flowgrade.id) {
          if ('flowgradescoreId' in grading) {
            const flowgradescore = _.find(flowgrade.scores, (score) => { return score.id === grading.flowgradescoreId })
            grading.score = flowgradescore ? flowgradescore.name : 'Bad' + grading.flowgradescoreId
          }
          gradingstoshow.push(grading)
        }
      }
      return gradingstoshow
    },
    showaction(submitaction) {
      const rv = (submitaction.show & this.showtype) != 0
      return rv
    },
    showactiongrade(submitaction) {
      const rv = submitaction.dograde === this.showtype
      return rv
    },
    showReviewersSection() {
      return this.pub.isowner || this.submit.reviewers.length > 0
    },
    toggleSubmitShow() {
      this.visible = !this.visible
      this.reviewerscols = this.visible ? 6 : 3
    },
    toggleShowSubmissions() {
      this.showsubmissions = !this.showsubmissions
    },
    toggleShowReviewers() {
      this.showreviewers = !this.showreviewers
    },
    toggleShowStatuses() {
      this.showstatuses = !this.showstatuses
    },
    toggleShowGradings() {
      this.showgradings = !this.showgradings
    },
    toggleSubGradings(flowgrade: any) {
      flowgrade.visible = !flowgrade.visible
    },
    toggleSubGradingSummary(flowgrade: any) {
      flowgrade.summary = !flowgrade.summary
    },
    async deleteSubmit(submit: any) {
      this.confirmsubmit = submit
      this.showConfirm(submit.name, "Are you sure you want to delete this submission and all its entries?", this.confirmedDeleteSubmit)
    },
    async confirmedDeleteSubmit() {
      try {
        const deleted = await api.submit.deleteSubmit(this.confirmsubmit.id)
        if (!deleted) return this.msgBoxOk('Could not delete this submission')
        await this.submitsStore.fetchpub(this.pubid)
        this.$nextTick(() => {
          this.msgBoxOk(this.confirmsubmit.name, 'Submission deleted')
        })
      } catch (e) {
        this.msgBoxError('Error deleting submission: ' + e.message)
      }
    },
    deleteSubmitStatus(submitstatus: any) {
      this.confirmsubmitstatus = submitstatus
      this.showConfirm(submitstatus.status, "Are you sure you want to delete this status?", this.confirmDeleteSubmitStatus)
    },
    async confirmDeleteSubmitStatus() {
      try {
        const OK = await api.submit.deleteSubmitStatus(this.confirmsubmitstatus.id)
        if (!OK) return this.msgBoxOk('Error deleting status')
        await this.submitsStore.fetchpub(this.pubid)
        this.$nextTick(() => {
          this.msgBoxOk('Status deleted')
        })
      } catch (e) {
        this.msgBoxError('Error deleting status: ' + e.message)
      }
    },
    addSubmitStatus(flow, submit) {
      if (!submit.newstatusid) return this.msgBoxOk('Please choose a new status')
      const flowstatus = _.find(flow.statuses, _flowstatus => { return _flowstatus.id === submit.newstatusid })
      if (!flowstatus) return this.msgBoxOk('Could not find flowstatus for ' + submit.newstatusid)
      this.confirmsubmit = submit
      this.showConfirm(flowstatus.status, "Adding this status will send any relevant emails. OK?", this.confirmAddSubmitStatus)
    },
    async confirmAddSubmitStatus(flow, submit) {
      try {
        const submitstatus = await api.submit.addSubmitStatus(this.confirmsubmit.id, this.confirmsubmit.newstatusid)
        if (!submitstatus) return this.msgBoxOk('Error adding status')
        // Selected status deselected by the following:
        await this.submitsStore.fetchpub(this.pubid)
        this.$nextTick(() => {
          this.msgBoxOk('Status added')
        })
      } catch (e) {
        this.msgBoxError('Error adding status: ' + e.message)
      }
    },
    removeReviewer(submit: any, reviewer: any) {
      this.confirmsubmit = submit
      this.confirmreviewer = reviewer
      this.showConfirm(reviewer.username, "Are you sure you want to remove this reviewer?", this.confirmRemoveReviewer)
    },
    async confirmRemoveReviewer() {
      try {
        const OK = await api.reviewers.removeReviewer(this.confirmsubmit.id, this.confirmreviewer.id)
        if (!OK) return this.msgBoxOk('Error removing reviewer')
        await this.submitsStore.fetchpub(this.pubid)
        this.$nextTick(() => {
          this.msgBoxOk(this.confirmreviewer.username, 'Reviewer removed')
        })
      } catch (e) {
        this.msgBoxError('Error removing reviewer: ' + e.message)
      }
    },
    async addReviewer(submit: any) {
      if (!submit.newreviewerid) return this.msgBoxOk('Please choose a reviewer')
      const reviewer = _.find(this.pub.reviewers, _already => { return _already.id === submit.newreviewerid })
      this.confirmsubmit = submit
      this.confirmreviewer = reviewer
      this.showConfirm(reviewer.name, "Do you want to add this reviewer as the LEAD? Cancel using (X) above.", () => { this.confirmAddReviewer(true) },
        'Add as lead reviewer', 'Add as reviewer', () => { this.confirmAddReviewer(false) })
    },
    async confirmAddReviewer(lead: Boolean) {
      try {
        const submit = this.confirmsubmit
        const submitreviewer = await api.reviewers.addReviewer(submit.id, submit.newreviewerid, lead)
        if (!submitreviewer) return this.msgBoxOk('Error adding reviewer')
        await this.submitsStore.fetchpub(this.pubid)
        this.$nextTick(() => {
          this.msgBoxOk(this.confirmreviewer.name, 'Reviewer added')
        })
      } catch (e) {
        this.msgBoxError('Error adding status: ' + e.message)
      }
    },
    enterGrading(submit, submitaction) {
      //console.log('submitaction', submitaction)
      this.submitaction = submitaction
      this.modaltitle = 'Add ' + submitaction.name
      this.decisionoptions = []
      const flowgrade = _.find(this.flow.flowgrades, _flowgrade => { return _flowgrade.id === submitaction.flowgradeid })
      if (!flowgrade) return this.msgBoxOk('Could not find flowgrade info')
      this.helptext = flowgrade.helptext
      this.helplinktext = flowgrade.helplinktext
      this.helplink = flowgrade.helplink
      this.decisionoptions = flowgrade.scores
      this.cancomment = flowgrade.cancomment
      this.canopttoreview = flowgrade.canopttoreview
      this.flowgradeid = submitaction.flowgradeid
      this.showGradingModal = true
    },
    hideGrading() {
      this.showGradingModal = false
    },
    async okGrading() {
      try {
        if (this.decision === 0) return this.msgBoxOk('No decision made!')
        const ok = await api.gradings.addGrading(this.submit.id, 0, this.flowgradeid, this.decision, this.comment, this.canreview)
        if (ok) {
          // Don't do this as it removes Next/Previous buttons:
          // await this.submitsStore.fetchpub(this.pubid)
          this.$nextTick(() => {
            this.showGradingModal = false
            this.submitaction.dograde = 0 // Hide this button clunkily, as we are not refreshing
            this.setMessage('Review added')
          })
        } else {
          this.msgBoxFail('Could not add review')
        }
      } catch (e) {
        this.msgBoxError('Error saving review: ' + e.message)
      }
    },
  }
}
</script>