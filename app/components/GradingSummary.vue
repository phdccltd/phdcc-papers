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

<script setup lang="ts">
import _ from 'lodash/core'

const props = defineProps<{
  flowgrade: any
  submit: any
}>()

const route = useRoute()
const pubid = computed(() => parseInt(route.params.pubid as string))

function scorecount(score: any) {
  let scorecount = 0
  for (const grading of props.submit.gradings) {
    if (grading.flowgradescoreId === score.id) {
      scorecount++
    }
  }
  return scorecount
}

function canreviewers() {
  let canreviewercount = 0
  for (const grading of props.submit.gradings) {
    if (grading.canreview) {
      canreviewercount++
    }
  }
  return canreviewercount
}
</script>
