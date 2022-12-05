<template>
  <div>
    <!-- ADD ENTRY TO SUBMIT -->
    <EntryForm formtype="addstage" />
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
