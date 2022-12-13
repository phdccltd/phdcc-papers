<template>
  <div>
    <!-- ADD NEW SUBMIT -->
    <EntryForm formtype="addsubmit" />
  </div>
</template>

<script lang="ts">
import EntryForm from '~/components/EntryForm.vue'

definePageMeta({
  middleware: ["authuser"]
})

export default {
  components: { EntryForm },
  data() {
    return {
    }
  },
}
</script>
