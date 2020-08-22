<template>
  <!-- ADD NEW SUBMIT -->
  <div>
    <EntryForm formtype="addsubmit" />
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
    async mounted() { // Client only
    },
    computed: {
    },
    methods: {
    },
    head() {
      return {
        title: page.title,
      }
    },
  }
</script>
<style>
</style>
