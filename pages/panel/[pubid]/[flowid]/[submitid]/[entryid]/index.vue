<template>
  <div>
    <!-- ENTRY LISTING: SHOW OR EDIT -->
    <EntryForm formtype="showedit" />
  </div>
</template>

<script lang="ts">

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
