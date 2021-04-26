<template>
  <!-- ADD NEW SUBMIT -->
  <div>
    <EntryForm formtype="addsubmit" />
  </div>
</template>

<script>
  import EntryForm from '~/components/EntryForm'
  import { page } from '@/utils/page'

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
