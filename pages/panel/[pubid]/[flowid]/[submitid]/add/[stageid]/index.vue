<template>
  <div>
    <!-- ADD ENTRY TO SUBMIT -->
    <EntryForm formtype="addstage" />
  </div>
</template>

<script>

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
