<template>
  <div>
    <!-- ENTRY LISTING: SHOW OR EDIT -->
    <EntryForm formtype="showedit" />
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
