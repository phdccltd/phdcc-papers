<template>
  <div>
  <!-- ENTRY LISTING: SHOW OR EDIT -->
  <EntryForm formtype="showedit" />
  </div>
</template>

<script lang="ts">
import EntryForm from '~/components/EntryForm.vue'

definePageMeta({
  middleware: ["authuser"]
})

export default {
  data() {
    return {
    }
  },
}
</script>
