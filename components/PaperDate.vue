<template>
  <span>
    {{ date }}
  </span>
</template>
<script>
  export default {
    props: {
      dt: {
        type: String
      },
    },
    computed: {
      date() {
        const dt = new Date(this.dt)
        return dt.toLocaleDateString()
      }
    }
  }
</script>
<style>
</style>
