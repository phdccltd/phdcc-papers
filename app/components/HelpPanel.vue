<template>
  <div class="mt-1 mb-1">
    <NoticeMessage v-if="showHelp" variant="info">
      <b-button variant="link" class="float-end" @click="toggleHelp" data-cy="helppanel-toggle">
        <v-icon icon="info-circle" size="2x" title="Hide help" />
        Hide this
      </b-button>
      <p v-if="custom">
        <strong>{{ custom }}</strong>
      </p>
      <div v-if="persitehelp" v-html="persitehelp">
      </div>
      <div v-else>
        <p>
          Here's your submissions for this journal/conference.
        </p>
        <ul>
          <li>Add new submissions (if enabled)</li>
          <li>Submit a further paper</li>
          <li>Read any feedback.</li>
          <li>See the status of your submissions.</li>
          <li>If you are a reviewer, then you will see what work you need to do.</li>
        </ul>
      </div>
    </NoticeMessage>
    <div v-else class="text-primary text-end clickme" @click="toggleHelp">
      <v-icon icon="question-circle" title="Show help" />
      Show help
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMiscStore } from '~/stores/misc'

defineProps({
  custom: { type: String }
})

const id = ref('panel')
const helpKey = computed(() => 'help-' + id.value)

const miscStore = useMiscStore()
const showHelp = computed(() => {
  return !(miscStore.get(helpKey.value) ?? false)
})

const persitehelp = computed(() => false)

function toggleHelp() {
  miscStore.set({
    key: helpKey.value,
    value: showHelp.value
  })
}
</script>