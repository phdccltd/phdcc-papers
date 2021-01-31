<template>
  <!-- ADD ENTRY TO SUBMIT -->
  <div>
    <EntryForm formtype="addstage" />
  </div>
</template>

<script>
  import EntryForm from '~/components/EntryForm'
  import { page } from '@/utils/phdcc'

  page.title = ''

  export default {
    middleware: 'authuser',
    components: { EntryForm },
    data() {
      return {
      }
    },
    head() {
      return {
        title: page.title,
      }
    },
  }
</script>
