<template>
  <div>
    <!-- ADD ENTRY TO SUBMIT -->
    <EntryForm formtype="addstage" />
  </div>
</template>

<script>
import EntryForm from '~/components/EntryForm'

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
