<template>
  <div>
    <b-row no-gutters>
      <b-col sm="3">
        Decisions
      </b-col>
      <b-col sm="9" class="formfieldview">
        <div v-for="score in flowgrade.scores" class="ps-1">
          {{ score.name }}:
          {{ scorecount(score) }}
        </div>
      </b-col>
    </b-row>
    <b-row no-gutters v-if="flowgrade.canopttoreview">
      <b-col sm="3">
        Can review
      </b-col>
      <b-col sm="9" class="formfieldview ps-1">
        {{ canreviewers() }}
      </b-col>
    </b-row>
  </div>
</template>

<script lang="ts">
import _ from 'lodash/core'
export default {
  props: {
    flowgrade: {
      required: true,
    },
    submit: {
      required: true,
    },
  },
  computed: {
    pubid() {
      const route = useRoute()
      return parseInt(route.params.pubid)
    },
  },
  methods: {
    scorecount(score) {
      let scorecount = 0
      for (const grading of this.submit.gradings) {
        if (grading.flowgradescoreId === score.id) {
          scorecount++
        }
      }
      return scorecount
    },
    canreviewers() {
      let canreviewercount = 0
      for (const grading of this.submit.gradings) {
        if (grading.canreview) {
          canreviewercount++
        }
      }
      return canreviewercount
    },
  },
}
</script>
