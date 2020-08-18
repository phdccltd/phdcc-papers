<template>
  <div>
    <div v-html="content">
    </div>
  </div>
</template>

<script>
  import { page } from '@/utils/phdcc'

  page.title = 'Welcome'

  export default {

    components: {
    },

    //middleware: 'sitepages', // Server once and Client thereafter

    /*validate({ params, query, store }) {
      // It will be called server-side once (on the first request to the Nuxt app) and client-side when navigating to further routes.
      console.log('_id validate', params.id)
      const path = '/' + params.id
      const sitepage = store.getters['sitepages/get'](path)
      console.log('_id validated', sitepage)
      if (sitepage)
        return true
      else
        return false // false will stop Nuxt.js to render the route and display the error page
      
    },*/

    mounted() { // Client only
      this.$store.dispatch('sitepages/fetch')
      this.$store.commit("page/setTitle", page.title)
    },

    computed: {
      content() {
        const path = '/'+this.$route.params.id
        console.log('_id content path', path)
        const sitepage = this.$store.getters['sitepages/get'](path)
        if (sitepage) {
          page.title = sitepage.title
          return sitepage.content
        }
        return ''
      }
    },
    head() {
      return {
        title: page.title,
      }
    },
  }
</script>
