<template>
  <div>
    <p>
      Oops - something went wrong
    </p>
  </div>
</template>
<script>
  import { page } from '@/utils/phdcc'

  const pageTitle = 'Error'
  page.title = pageTitle
  export default {
    async mounted() {
      console.log('_ error MOUNTED')
      this.$store.commit("page/setTitle", pageTitle)
    },
    head() {
      return {
        title: pageTitle,
      }
    },
  }
</script>
