<template>
  <div>
    <b-alert variant="danger" :show="error.length>0">
      {{error}}
    </b-alert>
    <b-alert variant="success" :show="message.length>0">
      {{message}}
    </b-alert>
    <b-alert variant="warning" :show="warning.length>0">
      {{warning}}
    </b-alert>
  </div>
</template>
<script>
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
  }
</script>
<style>
</style>
