<template>
  <div class="mt-1 mb-1">
    <NoticeMessage v-if="showHelp" variant="info">
      <b-button variant="link" class="float-end" @click="toggleHelp">
        <v-icon icon="info-circle" size="2x" title="Hide help" />
        Hide this
      </b-button>
      <p v-if="custom">
        <strong>{{ custom }}</strong>
      </p>
      <p>
        Use this page to send mails to user(s)
      </p>
      <ul>
        <li>Either choose a role - or All users or All submitters.</li>
        <li>Or choose a user</li>
        <li>If you want, choose one of the prepared mail templates to start the mail text</li>
        <li>Enter a subject and the text of the mail</li>
        <li>Only plain text is allowed and no substitutions are done</li>
        <li>Press Send when ready</li>
      </ul>
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

const id = ref('admin-mail')
const helpKey = computed(() => 'help-' + id.value)

const miscStore = useMiscStore()
const showHelp = computed(() => {
  return !(miscStore.get(helpKey.value) ?? false)
})

function toggleHelp() {
  miscStore.set({
    key: helpKey.value,
    value: showHelp.value
  })
}
</script>