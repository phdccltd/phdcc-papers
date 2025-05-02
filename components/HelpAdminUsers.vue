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
        Use this page to administer your users
      </p>
      <ul>
        <li>Add or remove roles for each user</li>
        <li>Remove access for a user</li>
        <li>Use the top filter to only see users who have a particular role</li>
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

const id = ref('admin-users')
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