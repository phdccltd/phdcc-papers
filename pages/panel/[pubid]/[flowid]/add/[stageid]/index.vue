<template>
  <div>
    <!-- ADD NEW SUBMIT -->
    <EntryForm formtype="addsubmit" />
  </div>
</template>

<script lang="ts">

export default {
  inject: { setLayoutMessage: {} },
  setup() {
    definePageMeta({
      middleware: ["authuser"]
    })
    return {}
  },
  mounted() {
    this.setLayoutMessage()
  },
  data() {
    return {
    }
  },
}
</script>
