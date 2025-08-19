<template>
  <div :class="grading.lead ? 'leadgrading' : ''">
    <b-row no-gutters v-if="datevisible">
      <b-col sm="3">
        <b-link v-if="pub.isowner" @click.prevent="deleteGrading()">
          <v-icon icon="times-circle" class="btn-outline-danger" />
        </b-link>
        {{ date }}
      </b-col>
      <b-col sm="9" class="formfieldview ps-1">
        {{ grading.username }} {{ grading.lead ? 'LEAD' : '' }}
      </b-col>
    </b-row>
    <b-row no-gutters v-if="decisionvisible">
      <b-col sm="3">
        Decision
      </b-col>
      <b-col sm="9" class="formfieldview ps-1">
        {{ grading.score }}
      </b-col>
    </b-row>
    <b-row no-gutters v-if="flowgrade.cancomment">
      <b-col sm="3">
        Comment
      </b-col>
      <b-col sm="9" class="formfieldview ps-1">
        <p v-for="para in commentParas" class="pre-textarea">{{ para }}</p>
      </b-col>
    </b-row>
    <b-row no-gutters v-if="flowgrade.canopttoreview">
      <b-col sm="3">
        Can review
      </b-col>
      <b-col sm="9" class="formfieldview ps-1">
        {{ canreview }}
        <span v-if="pub.isowner && canreview">
          <span v-if="isreviewer">- Already a reviewer</span>
          <b-button v-else-if="grading.hasReviewerRole" variant="outline-success" @click="addAsReviewer()">Add as reviewer</b-button>
          <span v-else> - doesn't have reviewer role</span>
        </span>
      </b-col>
    </b-row>
    <MessageBoxOK v-if="showMsgModal" />
    <ConfirmModal v-if="showConfirmModal" @confirm="confirmedOK" @cancel="cancelConfirm" />
  </div>
</template>

<script setup lang="ts">
import { useSubmitsStore } from '~/stores/submits'
import _ from 'lodash/core'
import api from '~/api'
import { showMsgModal, msgBoxOk, msgBoxFail, msgBoxError, showConfirmModal, showConfirm, confirmedOK, cancelConfirm } from '~/composables/useModalBoxes'

const props = defineProps({
  pub: { required: true },
  flowgrade: { required: true },
  grading: { required: true },
  submit: { required: true },
  addReviewer: { type: Function },
})

const submitsStore = useSubmitsStore()
const route = useRoute()

const pubid = computed(() => {
  return parseInt(route.params.pubid as string)
})

const datevisible = computed(() => {
  return 'dt' in props.grading
})

const decisionvisible = computed(() => {
  return 'score' in props.grading
})

const date = computed(() => {
  if (props.grading.dt === null) return ''
  const dt = new Date(props.grading.dt)
  return dt.toLocaleString()
})

const canreview = computed(() => {
  return props.grading.canreview ? 'YES' : 'NO'
})

const isreviewer = computed(() => {
  return _.find(props.submit.reviewers, (reviewer) => { return reviewer.userId === props.grading.userId })
})

const commentParas = computed(() => {
  return props.grading.comment.split('\n')
})

function addAsReviewer() {
  props.submit.newreviewerid = props.grading.userId
  props.addReviewer(props.submit)
}

function deleteGrading() {
  console.log("deleteGrading")
  const title = date.value + ': ' + props.grading.username + ' - ' + props.grading.score
  showConfirm(title, "Are you sure you want to remove this review?", confirmDeleteGrading)
}

async function confirmDeleteGrading() {
  try {
    const OK = await api.gradings.deleteGrading(props.submit.id, props.grading.id)
    if (!OK) return msgBoxOk('Error removing review')
    await submitsStore.fetchpub(pubid.value)
    nextTick(() => {
      msgBoxOk('Review removed')
    })
  } catch (e: any) {
    msgBoxError('Error removing review: ' + e.message)
  }
}
</script>
