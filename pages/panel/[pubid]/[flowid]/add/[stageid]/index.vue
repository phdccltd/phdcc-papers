<template>
  <div>
    <!-- ADD NEW SUBMIT -->
    <EntryForm formtype="addsubmit" />
  </div>
</template>

<script lang="ts">
import EntryForm from '~/components/EntryForm.vue'

export default {
  middleware: 'authuser',
  components: { EntryForm },
  data() {
    return {
    }
  },
}
</script>
