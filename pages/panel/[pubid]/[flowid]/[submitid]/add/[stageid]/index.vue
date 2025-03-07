<template>
  <div>
    <!-- ADD ENTRY TO SUBMIT -->
    <EntryForm formtype="addstage" />
  </div>
</template>

<script>

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
