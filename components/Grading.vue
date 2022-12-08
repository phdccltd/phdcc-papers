<template>
  <div :class="grading.lead ? 'leadgrading' : ''">
    <b-row no-gutters v-if="datevisible">
      <b-col sm="3">
        <b-link v-if="pub.isowner" @click="deleteGrading()">
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
        <b-form-textarea v-bind:model-value="grading.comment" plaintext max-rows="100" class="font-weight-bold" style="overflow-y: auto;"></b-form-textarea>
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
    <MessageBoxOK ref="okmsgbox" />
    <ConfirmModal ref="confirm" :title="confirmTitle" :message="confirmMessage" :cancelText="confirmCancelText" :confirmText="confirmOKText"
      @confirm="confirmedOK" @cancel="cancelConfirm" />
  </div>
</template>

<script lang="ts">
import { useSubmitsStore } from '~/stores/submits'
import _ from 'lodash/core'
import api from '~/api'
import modalBoxes from '@/mixins/modalBoxes'

export default {
  mixins: [modalBoxes],
  props: {
    pub: {
      required: true,
    },
    flowgrade: {
      required: true,
    },
    grading: {
      required: true,
    },
    submit: {
      required: true,
    },
    addReviewer: {
      type: Function,
    },
  },
  setup() {
    const submitsStore = useSubmitsStore()

    return { submitsStore }
  },
  computed: {
    pubid() {
      const route = useRoute()
      return parseInt(route.params.pubid)
    },
    datevisible() {
      return 'dt' in this.grading
    },
    decisionvisible() {
      return 'score' in this.grading
    },
    date() {
      if (this.grading.dt === null) return ''
      const dt = new Date(this.grading.dt)
      return dt.toLocaleString()
    },
    canreview() {
      return this.grading.canreview ? 'YES' : 'NO'
    },
    isreviewer() {
      return _.find(this.submit.reviewers, (reviewer) => { return reviewer.userId === this.grading.userId })
    },
  },
  methods: {
    addAsReviewer() {
      this.submit.newreviewerid = this.grading.userId
      this.addReviewer(this.submit)
    },
    deleteGrading() {
      console.log("deleteGrading")
      const title = this.date + ': ' + this.grading.username + ' - ' + this.grading.score
      this.showConfirm(title, "Are you sure you want to remove this review?", this.confirmDeleteGrading)
    },
    async confirmDeleteGrading() {
      try {
        const OK = await api.gradings.deleteGrading(this.submit.id, this.grading.id)
        if (!OK) return this.msgBoxOk('Error removing review')
        await this.submitsStore.fetchpub(this.pubid)
        this.$nextTick(() => {
          this.msgBoxOk('Review removed')
        })
      } catch (e) {
        await this.msgBoxOk('Error removing review: ' + e.message)
      }
    },
  },
}
</script>
