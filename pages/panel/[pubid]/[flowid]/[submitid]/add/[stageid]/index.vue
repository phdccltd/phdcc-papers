<template>
  <div>
    <!-- ADD ENTRY TO SUBMIT -->
    <EntryForm formtype="addstage" />
  </div>
</template>

<script>
import EntryForm from '~/components/EntryForm'

export default {
  middleware: 'authuser',
  components: { EntryForm },
  data() {
    return {
    }
  },
}
</script>
