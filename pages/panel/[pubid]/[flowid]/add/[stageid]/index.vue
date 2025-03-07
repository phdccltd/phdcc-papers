<template>
  <div>
    <!-- ADD NEW SUBMIT -->
    <EntryForm formtype="addsubmit" />
  </div>
</template>

<script lang="ts">

export default {
  setup() {
    definePageMeta({
      middleware: ["authuser"]
    })
    return {}
  },
  data() {
    return {
    }
  },
}
</script>
