<template>
  <div>
    <!-- ADD ENTRY TO SUBMIT -->
    <EntryForm formtype="addstage" />
  </div>
</template>

<script>

definePageMeta({
  middleware: ["authuser"]
})

export default {
  inject: { setLayoutMessage: {} },
  mounted() {
    this.setLayoutMessage()
  },
  data() {
    return {
    }
  },
}
</script>
