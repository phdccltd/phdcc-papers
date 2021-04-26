<!-- page (not layout) that shows within layouts/default.vue -->
<template>
  <div class="container">
    <h2 v-if="error.statusCode === 404">Page not found</h2>
    <h2 v-else>An error occurred</h2>
    <nuxt-link to="/">Home page</nuxt-link>
  </div>
</template>

<script>
  import { page } from '@/utils/page'
  page.title = 'Error'

  export default {
    props: ['error'],
    async mounted() {
      page.title = 'Error'
      console.log('ERROR mounted', page.title)
      this.$store.commit("page/setTitle", page.title)
    },
    head() {
      return {
        title: page.title,
      }
    },
  }
</script>
