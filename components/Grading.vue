<template>
  <div :class="grading.lead?'leadgrading':''">
    <b-row no-gutters v-if="datevisible">
      <b-col sm="3">
        <b-link v-if="pub.isowner" @click="deleteGrading()">
          <v-icon name="times-circle" scale="1" class="btn-outline-danger" />
        </b-link>
        {{date}}
      </b-col>
      <b-col sm="9" class="formfieldview pl-1">
        {{grading.username}} {{grading.lead?'LEAD':''}}
      </b-col>
    </b-row>
    <b-row no-gutters v-if="decisionvisible">
      <b-col sm="3">
        Decision
      </b-col>
      <b-col sm="9" class="formfieldview pl-1">
        {{grading.score}}
      </b-col>
    </b-row>
    <b-row no-gutters v-if="flowgrade.cancomment">
      <b-col sm="3">
        Comment
      </b-col>
      <b-col sm="9" class="formfieldview pl-1">
        <b-form-textarea :value="grading.comment" plaintext max-rows="100" class="font-weight-bold" style="overflow-y: auto;"></b-form-textarea>
      </b-col>
    </b-row>
    <b-row no-gutters v-if="flowgrade.canopttoreview">
      <b-col sm="3">
        Can review
      </b-col>
      <b-col sm="9" class="formfieldview pl-1">
        {{canreview}}
        <span v-if="pub.isowner && canreview">
          <span v-if="isreviewer">- Already a reviewer</span>
          <b-btn v-else-if="grading.hasReviewerRole" variant="outline-success" @click="addAsReviewer()">Add as reviewer</b-btn>
          <span v-else> - doesn't have reviewer role</span>
        </span>
      </b-col>
    </b-row>
  </div>
</template>
<script>
  const _ = require('lodash/core')
  export default {
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
    computed: {
      pubid() {
        return parseInt(this.$route.params.pubid)
      },
      datevisible() {
        return 'dt' in this.grading
      },
      decisionvisible() {
        return 'score' in this.grading
      },
      date() {
        if (this.grading.dt===null) return ''
        const dt = new Date(this.grading.dt)
        return dt.toLocaleString()
      },
      canreview() {
        return this.grading.canreview?'YES':'NO'
      },
      isreviewer() {
        return _.find(this.submit.reviewers, (reviewer) => { return reviewer.userId === this.grading.userId})
      },
    },
    methods: {
      addAsReviewer() {
        this.submit.newreviewerid = this.grading.userId
        this.addReviewer(this.submit)
      },
      async deleteGrading() {
        try {
          if (!await this.$bvModal.msgBoxConfirm('Are you sure you want to remove this grading?', { title: this.date + ': ' + this.grading.username + ' - ' + this.grading.score })) return
          const OK = await this.$api.gradings.deleteGrading(this.submit.id, this.grading.id)
          if (!OK) return await this.$bvModal.msgBoxOk('Error removing grading')
          this.$bvToast.toast('Grading removed', { title: 'SUCCESS', toaster: 'b-toaster-top-center', variant: 'success', })
          this.$store.dispatch('submits/fetchpub', this.pubid)
        } catch (e) {
          this.$bvModal.msgBoxOk('Error removing grading: ' + e.message)
        }
      },
    },
  }
</script>
<style>
</style>
