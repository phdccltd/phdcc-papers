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
<script lang="ts">
export default {
  props: {
    error: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      default: '',
    },
    warning: {
      type: String,
      default: '',
    },
  },
  setup(props) {
  }
}
</script>
