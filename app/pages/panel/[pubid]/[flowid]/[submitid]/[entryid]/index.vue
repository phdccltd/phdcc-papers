<template>
  <div>
    <!-- ENTRY LISTING: SHOW OR EDIT -->
    <EntryForm formtype="showedit" />
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
