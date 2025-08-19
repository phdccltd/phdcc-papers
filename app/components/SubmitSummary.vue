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
                  <v-icon v-for="sentreminder in reviewer.sentreminders" :key="sentreminder.id" icon="envelope" color="pink" :title="sentreminder.dt"
                    class="me-1" />
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
    <MessageBoxOK v-if="showMsgModal" />
    <ConfirmModal v-if="showConfirmModal" @confirm="confirmedOK" @cancel="cancelConfirm" />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'
import { usePubsStore } from '~/stores/pubs'
import { useSubmitsStore } from '~/stores/submits'

import _ from 'lodash/core'
import api from '~/api'
import { showMsgModal, msgBoxOk, msgBoxFail, msgBoxError, showConfirmModal, showConfirm, confirmedOK, cancelConfirm } from '~/composables/useModalBoxes'

const props = defineProps({
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
})

const authStore = useAuthStore()
const miscStore = useMiscStore()
const pubsStore = usePubsStore()
const submitsStore = useSubmitsStore()
const route = useRoute()

const visible = ref(true)
const showsubmissions = ref(true)
const showreviewers = ref(true)
const showstatuses = ref(true)
const showgradings = ref(true)
const submitaction = ref(null)
const helptext = ref(false)
const helplinktext = ref(false)
const helplink = ref(false)
const decision = ref(0)
const decisionoptions = ref([])
const cancomment = ref(false)
const comment = ref('')
const canopttoreview = ref(false)
const canreview = ref(false)
const flowgradeid = ref(0)
const confirmsubmit = ref(null)
const confirmreviewer = ref(null)
const confirmsubmitstatus = ref(null)
const showGradingModal = ref(false)
const modaltitle = ref('GGG')

onMounted(() => {
  if (props.showtype == 4) visible.value = false
})

const pubid = computed(() => {
  return parseInt(route.params.pubid as string)
})

const newstatusoptions = computed(() => {
  const options = []
  if (!props.flow) return options
  for (const flowstatus of props.flow.statuses) {
    options.push({ value: flowstatus.id, text: flowstatus.status })
  }
  return options
})

const newrevieweroptions = computed(() => {
  const options = []
  for (const reviewer of props.pub.reviewers) {
    const already = _.find(props.submit.reviewers, _already => { return _already.userId === reviewer.id })
    if (!already) {
      options.push({ value: reviewer.id, text: reviewer.name + ' - ' + reviewer.roles })
    }
  }
  options.sort(function (a, b) {
    return a.text.localeCompare(b.text)
  })
  return options
})

function gradingicons(reviewer: any) {
  const flowgrades = props.flow.flowgrades
  const gradingicons = []
  for (const grading of props.submit.gradings) {
    if (grading.userId === reviewer.userId) {
      const flowgrade = _.find(flowgrades, _flowgrade => { return grading.flowgradeId === _flowgrade.id })
      gradingicons.push({ id: grading.id, name: flowgrade ? flowgrade.name : '', colour: flowgrade ? flowgrade.tickcolour : 'green' })
    }
  }
  return gradingicons
}

function filteredflowgrades() {
  const flowgradestoshow = []
  for (const flowgrade of props.flow.flowgrades) {
    // If we've been given some gradings, then it must be OK to show them
    const anygradings = _.find(props.submit.gradings, (grading) => { return grading.flowgradeId === flowgrade.id })
    if (anygradings) {
      flowgradestoshow.push(flowgrade)
    }
  }
  return flowgradestoshow
}

function filteredgradings(gradings: any[], flowgrade: any) {
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
}

function showaction(submitaction: any) {
  const rv = (submitaction.show & props.showtype) != 0
  return rv
}

function showactiongrade(submitaction: any) {
  const rv = submitaction.dograde === props.showtype
  return rv
}

function showReviewersSection() {
  return props.pub.isowner || props.submit.reviewers.length > 0
}

function toggleSubmitShow() {
  visible.value = !visible.value
}

function toggleShowSubmissions() {
  showsubmissions.value = !showsubmissions.value
}

function toggleShowReviewers() {
  showreviewers.value = !showreviewers.value
}

function toggleShowStatuses() {
  showstatuses.value = !showstatuses.value
}

function toggleShowGradings() {
  showgradings.value = !showgradings.value
}

function toggleSubGradings(flowgrade: any) {
  flowgrade.visible = !flowgrade.visible
}

function toggleSubGradingSummary(flowgrade: any) {
  flowgrade.summary = !flowgrade.summary
}

async function deleteSubmit(submit: any) {
  confirmsubmit.value = submit
  showConfirm(submit.name, "Are you sure you want to delete this submission and all its entries?", confirmedDeleteSubmit)
}

async function confirmedDeleteSubmit() {
  try {
    const deleted = await api.submit.deleteSubmit(confirmsubmit.value.id)
    if (!deleted) return msgBoxOk('Could not delete this submission')
    await submitsStore.fetchpub(pubid.value)
    nextTick(() => {
      msgBoxOk(confirmsubmit.value.name, 'Submission deleted')
    })
  } catch (e: any) {
    msgBoxError('Error deleting submission: ' + e.message)
  }
}

function deleteSubmitStatus(submitstatus: any) {
  confirmsubmitstatus.value = submitstatus
  showConfirm(submitstatus.status, "Are you sure you want to delete this status?", confirmDeleteSubmitStatus)
}

async function confirmDeleteSubmitStatus() {
  try {
    const OK = await api.submit.deleteSubmitStatus(confirmsubmitstatus.value.id)
    if (!OK) return msgBoxOk('Error deleting status')
    await submitsStore.fetchpub(pubid.value)
    nextTick(() => {
      msgBoxOk('Status deleted')
    })
  } catch (e: any) {
    msgBoxError('Error deleting status: ' + e.message)
  }
}

function addSubmitStatus(flow: any, submit: any) {
  if (!submit.newstatusid) return msgBoxOk('Please choose a new status')
  const flowstatus = _.find(flow.statuses, _flowstatus => { return _flowstatus.id === submit.newstatusid })
  if (!flowstatus) return msgBoxOk('Could not find flowstatus for ' + submit.newstatusid)
  confirmsubmit.value = submit
  showConfirm(flowstatus.status, "Adding this status will send any relevant emails. OK?", confirmAddSubmitStatus)
}

async function confirmAddSubmitStatus() {
  try {
    const submitstatus = await api.submit.addSubmitStatus(confirmsubmit.value.id, confirmsubmit.value.newstatusid)
    if (!submitstatus) return msgBoxOk('Error adding status')
    // Selected status deselected by the following:
    await submitsStore.fetchpub(pubid.value)
    nextTick(() => {
      msgBoxOk('Status added')
    })
  } catch (e: any) {
    msgBoxError('Error adding status: ' + e.message)
  }
}

function removeReviewer(submit: any, reviewer: any) {
  confirmsubmit.value = submit
  confirmreviewer.value = reviewer
  showConfirm(reviewer.username, "Are you sure you want to remove this reviewer?", confirmRemoveReviewer)
}

async function confirmRemoveReviewer() {
  try {
    const OK = await api.reviewers.removeReviewer(confirmsubmit.value.id, confirmreviewer.value.id)
    if (!OK) return msgBoxOk('Error removing reviewer')
    await submitsStore.fetchpub(pubid.value)
    nextTick(() => {
      msgBoxOk(confirmreviewer.value.username, 'Reviewer removed')
    })
  } catch (e: any) {
    msgBoxError('Error removing reviewer: ' + e.message)
  }
}

async function addReviewer(submit: any) {
  if (!submit.newreviewerid) return msgBoxOk('Please choose a reviewer')
  const reviewer = _.find(props.pub.reviewers, _already => { return _already.id === submit.newreviewerid })
  confirmsubmit.value = submit
  confirmreviewer.value = reviewer
  showConfirm(reviewer.name, "Do you want to add this reviewer as the LEAD? Cancel using (X) above.", () => { confirmAddReviewer(true) },
    'Add as lead reviewer', 'Add as reviewer', () => { confirmAddReviewer(false) })
}

async function confirmAddReviewer(lead: Boolean) {
  try {
    const submit = confirmsubmit.value
    const submitreviewer = await api.reviewers.addReviewer(submit.id, submit.newreviewerid, lead)
    if (!submitreviewer) return msgBoxOk('Error adding reviewer')
    await submitsStore.fetchpub(pubid.value)
    nextTick(() => {
      msgBoxOk(confirmreviewer.value.name, 'Reviewer added')
    })
  } catch (e: any) {
    msgBoxError('Error adding status: ' + e.message)
  }
}

function enterGrading(submit: any, submitactionParam: any) {
  //console.log('submitaction', submitactionParam)
  submitaction.value = submitactionParam
  modaltitle.value = 'Add ' + submitactionParam.name
  decisionoptions.value = []
  const flowgrade = _.find(props.flow.flowgrades, _flowgrade => { return _flowgrade.id === submitactionParam.flowgradeid })
  if (!flowgrade) return msgBoxOk('Could not find flowgrade info')
  helptext.value = flowgrade.helptext
  helplinktext.value = flowgrade.helplinktext
  helplink.value = flowgrade.helplink
  decisionoptions.value = flowgrade.scores
  cancomment.value = flowgrade.cancomment
  canopttoreview.value = flowgrade.canopttoreview
  flowgradeid.value = submitactionParam.flowgradeid
  showGradingModal.value = true
}

function hideGrading() {
  showGradingModal.value = false
}

async function okGrading() {
  try {
    if (decision.value === 0) return msgBoxOk('No decision made!')
    const ok = await api.gradings.addGrading(props.submit.id, 0, flowgradeid.value, decision.value, comment.value, canreview.value)
    if (ok) {
      // Don't do this as it removes Next/Previous buttons:
      // await submitsStore.fetchpub(pubid.value)
      nextTick(() => {
        showGradingModal.value = false
        submitaction.value.dograde = 0 // Hide this button clunkily, as we are not refreshing
        props.setMessage('Review added')
      })
    } else {
      msgBoxFail('Could not add review')
    }
  } catch (e: any) {
    msgBoxError('Error saving review: ' + e.message)
  }
}
</script>