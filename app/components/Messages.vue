<!-- DONE -->
<template>
  <div>
    <b-alert variant="danger" :modelValue="error.length > 0" data-cy="messages-error">
      {{ error }}
    </b-alert>
    <b-alert variant="success" :modelValue="message.length > 0" data-cy="messages-danger">
      {{ message }}
    </b-alert>
    <b-alert variant="warning" :modelValue="warning.length > 0" data-cy="messages-warning">
      {{ warning }}
    </b-alert>
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  error: { type: String, default: '' },
  message: { type: String, default: '' },
  warning: { type: String, default: '' },
})
</script>
