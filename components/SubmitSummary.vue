<!--
  showtype  bit mask  0x1 top level   Show 'needed'
                      0x2 submit      Show 'needed'
                      0x4 entry       Show 'add grading'
-->
<template>
  <div>
    <div v-if="submit">
      <div v-if="showtype==1">
        <h3 class="publist-submit-h3">
          <b-btn v-if="showingadminoptions" variant="outline-danger" class="float-right" @click="deleteSubmit(submit)">
            Delete
          </b-btn>
          <nuxt-link :to="'/panel/'+pubid+'/'+flow.id+'/'+submit.id">
            {{ submit.id }}:
            {{ submit.name }}
          </nuxt-link>
          {{ submit.user }}
          <b-btn v-if="showingadminoptions" variant="link" @click="editSubmit(submit)">
            <v-icon name="edit" scale="1.5" class="btn-outline-warning" />
          </b-btn>
        </h3>
        <div class="publist-current-status clearfix">
          Status: <PaperDate :dt="submit.dtstatus" />
          <span class="status">{{ submit.status }}</span>
          <span v-for="submitaction in submit.actions" :key="submitaction.id">
            <b-btn v-if="showaction(submitaction)" class="float-right ml-1" variant="success" :to="submitaction.route">{{submitaction.name}}</b-btn>
          </span>
          <div class="float-right">
            <div v-for="actiondone in submit.actionsdone" :key="actiondone.id" class="actiondone">{{actiondone.name}}</div>
            <div v-if="pub.isowner && submit.owneradvice" class="actiondone">{{submit.owneradvice}}</div>
          </div>
        </div>
      </div>
      <div v-else class="border rounded border-black">
        <h2 class="bg-yellow p-2">
          <b-btn v-if="showtype==4" variant="link" @click="toggleSubmitShow()" style="margin-left: -0.6rem;">
            <v-icon v-if="visible" name="minus-square" scale="2" />
            <v-icon v-if="!visible" name="plus-square" scale="2" />
          </b-btn>
          <b-btn v-if="showingadminoptions" variant="outline-danger" class="float-right" @click="deleteSubmit(submit)">
            Delete
          </b-btn>

          <nuxt-link v-if="showtype==4" :to="'/panel/'+pubid+'/'+flow.id+'/'+submit.id">
            {{ submit.id }}:
            {{ submit.name }}
          </nuxt-link>
          <span v-else>
            {{ submit.id }}:
            {{ submit.name }}
          </span>
          {{ submit.user }}
          <b-btn v-if="showingadminoptions" variant="link" @click="editSubmit(submit)">
            <v-icon name="edit" scale="1.5" class="btn-outline-warning" />
          </b-btn>
        </h2>
        <div class="publist-current-status clearfix">
          <PaperDate :dt="submit.dtstatus" />
          <span class="status">{{ submit.status }}</span>
          <span v-for="submitaction in submit.actions" :key="submitaction.id">
            <b-btn v-if="showactiongrade(submitaction)" class="float-right ml-1" variant="success" @click="enterGrading(submit,submitaction)">{{submitaction.gradename}}</b-btn>
            <b-btn v-if="showaction(submitaction)" class="float-right ml-1" variant="success" :to="submitaction.route">{{submitaction.name}}</b-btn>
          </span>
          <div v-if="pub.isowner && submit.owneradvice" class="actiondone float-right mr-2">{{submit.owneradvice}}</div>
        </div>

        <b-container v-if="visible">
          <div class="border rounded border-black mt-1 p-1">
            <b-row>
              <b-col sm="6">
                <h3 class="publist-submit-h3">
                  <b-link @click="toggleShowSubmissions()">Submissions</b-link>
                </h3>
              </b-col>
              <b-col sm="6" v-if="showsubmissions">
                <b-list-group class="entries">
                  <b-list-group-item v-for="entry in submit.entries" :key="entry.id" class="entry">
                    <PaperDate :dt="entry.dt" />
                    <b-btn variant="outline-success" :to="'/panel/'+pubid+'/'+flow.id+'/'+submit.id+'/'+entry.id">
                      {{entry.stage.name}}
                    </b-btn>
                  </b-list-group-item>
                </b-list-group>
              </b-col>
            </b-row>
          </div>
          <div v-if="pub.isowner" class="border rounded border-black mt-1 p-1">
            <b-row>
              <b-col sm="6">
                <h3 class="publist-submit-h3">
                  <b-link @click="toggleShowStatuses()">Statuses</b-link>
                </h3>
                <form v-if="showstatuses" ref="form" @submit.stop.prevent>
                  <b-form-select v-model="submit.newstatusid" :options="newstatusoptions" size="sm" style="width:auto;"></b-form-select>
                  <b-btn variant="outline-success" @click="addSubmitStatus(flow,submit)">Add status</b-btn>
                </form>
              </b-col>
              <b-col sm="6" v-if="showstatuses">
                <div v-for="submitstatus in submit.statuses" :key="submitstatus.id">
                  <b-link @click="deleteSubmitStatus(submitstatus)">
                    <v-icon name="times-circle" scale="1" class="btn-outline-danger" />
                  </b-link>
                  <PaperDate :dt="submitstatus.dt" />
                  <span class="status">{{ submitstatus.status }}</span>
                </div>
                <div v-if="submit.statuses.length===0">
                  No statuses set
                </div>
              </b-col>
            </b-row>
          </div>

          <div v-if="showReviewersSection()" class="border rounded border-black mt-1">
            <b-row>
              <b-col sm="6">
                <h3 class="publist-submit-h3">
                  <b-link @click="toggleShowReviewers()">Reviewers</b-link>
                </h3>
                <form ref="form" @submit.stop.prevent v-if="showreviewers && pub.isowner">
                  <b-form-select v-model="submit.newreviewerid" :options="newrevieweroptions" size="sm" style="width:auto;"></b-form-select>
                  <b-btn variant="outline-success" @click="addReviewer(submit)">Add reviewer</b-btn>
                </form>
              </b-col>
              <b-col sm="6" v-if="showreviewers">
                <div v-for="reviewer in submit.reviewers" :key="reviewer.id">
                  <b-link v-if="pub.isowner" @click="removeReviewer(submit,reviewer)">
                    <v-icon name="times-circle" scale="1" class="btn-outline-danger" />
                  </b-link>
                  {{reviewer.username}} {{reviewer.lead?'(Lead)':''}}
                  <v-icon v-for="grading in gradingicons(reviewer)" :key="grading.id" name="check-circle" scale="1" :color="grading.colour" v-b-popover.hover.top="grading.name" class="mr-1" />
                  <v-icon v-for="sentreminder in reviewer.sentreminders" :key="sentreminder.id" name="envelope" scale="1" color="pink" v-b-popover.hover.top="sentreminder.dt" class="mr-1" />
                </div>
              </b-col>
            </b-row>
          </div>
          <div class="border rounded border-black mt-1 p-1">
            <h3 class="publist-submit-h3 mb-1">
              <b-link @click="toggleShowGradings()">Reviews</b-link>
            </h3>
            <b-list-group v-if="showgradings" class="gradings">
              <b-list-group-item v-for="flowgrade in filteredflowgrades()" :key="flowgrade.id" class="grading p-2">
                <h4>
                  <b-link @click="toggleSubGradings(flowgrade)">{{flowgrade.name}}</b-link>
                  - {{filteredgradings(submit.gradings,flowgrade).length}}
                </h4>
                <b-list-group v-if="flowgrade.visible">
                  <b-list-group-item v-for="grading in filteredgradings(submit.gradings,flowgrade)" :key="grading.id" class="p-2">
                    <Grading :pub="pub" :flowgrade="flowgrade" :grading="grading" :submit="submit" :addReviewer="addReviewer" />
                  </b-list-group-item>
                </b-list-group>
                <div v-if="pub.isowner">
                  <h4>
                    <b-link @click="toggleSubGradingSummary(flowgrade)">{{flowgrade.name}} summary</b-link>
                  </h4>
                  <b-list-group v-if="flowgrade.summary">
                    <b-list-group-item class="p-2">
                      <GradingSummary :flowgrade="flowgrade" :submit="submit" />
                    </b-list-group-item>
                  </b-list-group>
                </div>
              </b-list-group-item>
              <div v-if="filteredflowgrades().length===0">
                No reviews
              </div>
            </b-list-group>
          </div>
        </b-container>
      </div>
    </div>

    <b-modal id="bv-modal-grading" centered no-close-on-backdrop @ok="okGrading">
      <template v-slot:modal-title>
        {{modaltitle}}
      </template>
      <form ref="form" @submit.stop.prevent>
        <b-form-row>
          <b-col sm="3">
            <b-btn v-if="helplinktext && helplink" variant="outline-success" :href="helplink" target="_blank">{{helplinktext}}</b-btn>
          </b-col>
          <b-col sm="9">
            {{helptext}}
          </b-col>
        </b-form-row>
        <b-form-group label="Decision"
                      label-for="decision"
                      label-cols-sm="3">
          <b-form-select v-model="decision"
                         :options="decisionoptions"
                         value-field="id"
                         text-field="name"
                         :select-size="4">
          </b-form-select>
        </b-form-group>
        <b-form-group v-if="cancomment"
                      label="Comment"
                      label-for="comment"
                      label-cols-sm="3">
          <b-form-textarea id="comment"
                           v-model="comment"
                           rows="10"
                           max-rows="100"
                           style="overflow-y: auto;">
          </b-form-textarea>
        </b-form-group>
        <b-form-group v-if="canopttoreview"
                      label-cols-sm="3">
          <b-form-checkbox v-model="canreview"
                           name="checkbox-1"
                           value="true"
                           unchecked-value="false">
            I can review
          </b-form-checkbox>
        </b-form-group>
      </form>
    </b-modal>

  </div>
</template>
<script>
  import PaperDate from '~/components/PaperDate'
  import Grading from '~/components/Grading'
  import GradingSummary from '~/components/GradingSummary'
  const _ = require('lodash/core')

  export default {
    components: { PaperDate, Grading, GradingSummary, },
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
      }
    },
    mounted() {
      if (this.showtype == 4) this.visible = false
    },
    computed: {
      pubid() {
        return parseInt(this.$route.params.pubid)
      },
      newstatusoptions() {
        const options = []
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
      toggleSubGradings(flowgrade) {
        flowgrade.visible = !flowgrade.visible
      },
      toggleSubGradingSummary(flowgrade) {
        flowgrade.summary = !flowgrade.summary
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
          await this.$bvModal.msgBoxOk('Submission deleted')
          this.$store.dispatch('submits/fetchpub', this.pubid)
        } catch (e) {
          await this.$bvModal.msgBoxOk('Error deleting submission: ' + e.message)
        }
      },
      async deleteSubmitStatus(submitstatus) {
        try {
          //console.log('deleteSubmitStatus', submitstatus.id)
          if (!await this.$bvModal.msgBoxConfirm('Are you sure you want to delete this status?', { title: submitstatus.status })) return
          const OK = await this.$api.submit.deleteSubmitStatus(submitstatus.id)
          if (!OK) return await this.$bvModal.msgBoxOk('Error deleting status')
          this.$store.dispatch('submits/fetchpub', this.pubid)
          this.$nextTick(() => {
            this.$bvModal.msgBoxOk('Status deleted')
          })
        } catch (e) {
          await this.$bvModal.msgBoxOk('Error deleting status: ' + e.message)
        }
      },
      async addSubmitStatus(flow, submit) {
        try {
          if (!submit.newstatusid) return await this.$bvModal.msgBoxOk('Please choose a new status')
          const flowstatus = _.find(flow.statuses, _flowstatus => { return _flowstatus.id === submit.newstatusid })
          if (!flowstatus) return await this.$bvModal.msgBoxOk('Could not find flowstatus for ' + submit.newstatusid)
          if (!await this.$bvModal.msgBoxConfirm('Adding this status will send any relevant emails. OK?', { title: flowstatus.status })) return
          const submitstatus = await this.$api.submit.addSubmitStatus(submit.id, submit.newstatusid)
          if (!submitstatus) return await this.$bvModal.msgBoxOk('Error adding status')
          //submit.newstatusid = null // TODO This doesn't work ie status shows as selected when it is actually reset to null by following:
          this.$store.dispatch('submits/fetchpub', this.pubid)
          this.$nextTick(() => {
            this.$bvModal.msgBoxOk('Status added')
          })
        } catch (e) {
          await this.$bvModal.msgBoxOk('Error adding status: ' + e.message)
        }
      },
      async removeReviewer(submit, reviewer) {
        try {
          if (!await this.$bvModal.msgBoxConfirm('Are you sure you want to remove this reviewer?', { title: reviewer.username })) return
          const OK = await this.$api.reviewers.removeReviewer(submit.id, reviewer.id)
          if (!OK) return await this.$bvModal.msgBoxOk('Error removing reviewer')
          this.$store.dispatch('submits/fetchpub', this.pubid)
          this.$nextTick(() => {
            this.$bvModal.msgBoxOk('Reviewer removed')
          })
        } catch (e) {
          await this.$bvModal.msgBoxOk('Error removing reviewer: ' + e.message)
        }
      },
      async addReviewer(submit) {
        try {
          if (!submit.newreviewerid) return await this.$bvModal.msgBoxOk('Please choose a reviewer')
          const notlead = await this.$bvModal.msgBoxConfirm('Do you want to add this reviewer as the LEAD? Escape to cancel.', { okTitle: 'Add as reviewer', cancelTitle: 'Add as lead reviewer' })
          if (notlead === null) return
          console.log(submit.newreviewerid, notlead)

          const submitreviewer = await this.$api.reviewers.addReviewer(submit.id, submit.newreviewerid, !notlead)
          if (!submitreviewer) return await this.$bvModal.msgBoxOk('Error adding reviewer')
          //submit.newreviewerid = null // TODO This doesn't work ie reviewer still shows as selected when it is actually reset to null by following:
          this.$store.dispatch('submits/fetchpub', this.pubid)
          this.$nextTick(() => {
            this.$bvModal.msgBoxOk('Reviewer added')
          })
        } catch (e) {
          await this.$bvModal.msgBoxOk('Error adding status: ' + e.message)
        }
      },
      enterGrading(submit, submitaction) {
        console.log('submitaction', submitaction)
        this.submitaction = submitaction
        this.modaltitle = 'Add ' + submitaction.name
        this.decisionoptions = []
        const flowgrade = _.find(this.flow.flowgrades, _flowgrade => { return _flowgrade.id === submitaction.flowgradeid })
        if (!flowgrade) return this.$bvModal.msgBoxOk('Could not find flowgrade info')
        this.helptext = flowgrade.helptext
        this.helplinktext = flowgrade.helplinktext
        this.helplink = flowgrade.helplink
        this.decisionoptions = flowgrade.scores
        this.cancomment = flowgrade.cancomment
        this.canopttoreview = flowgrade.canopttoreview
        this.flowgradeid = submitaction.flowgradeid
        //this.decision = 0 // Save entry in case of exit
        //this.comment = ''
        //this.canreview = false
        this.$bvModal.show('bv-modal-grading')
      },
      async okGrading(bvModalEvt) {
        bvModalEvt.preventDefault()
        try {
          if (this.decision === 0) return await this.$bvModal.msgBoxOk('No decision made!')
          const ok = await this.$api.gradings.addGrading(this.submit.id, 0, this.flowgradeid, this.decision, this.comment, this.canreview)
          if (ok) {
            // Don't do this as it removes Next/Previous buttons:
            // this.$store.dispatch('submits/fetchpub', this.pubid)
            this.$nextTick(() => {
              this.$bvModal.hide('bv-modal-grading')
              this.submitaction.dograde = 0 // Hide this button clunkily, as we are not refreshing
              this.setMessage('Review added')
            })
          } else {
            await this.$bvModal.msgBoxOk('Could not add review', { title: 'FAIL', headerBgVariant: 'warning' })
          }
        } catch (e) {
          await this.$bvModal.msgBoxOk('Error saving review: ' + e.message)
        }
      },
    },
  }
</script>
