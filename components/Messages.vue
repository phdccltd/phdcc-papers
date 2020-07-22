<template>
  <div>
    <b-alert variant="danger" :show="error!=false">
      {{error}}
    </b-alert>
    <b-alert variant="success" :show="message!=false">
      {{message}}
    </b-alert>
  </div>
</template>
<script>
  export default {
    props: {
      error: {
        type: String
      },
      message: {
        type: String
      },
    },
  }
</script>
<style>
</style>
