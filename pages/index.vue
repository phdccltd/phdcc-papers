<template>
  <!-- SITE HOME PAGE -->
  <div>
    <div v-html="content">
    </div>
  </div>
</template>

<script>
//import Logo from '~/components/Logo.vue'
  import { page } from '@/utils/page'

  page.title = 'Welcome'

  export default {
    components: {
    },

    //middleware: 'sitepages', // Client and Server

    asyncData({ req, res }) { // this (component) not available // Client and Server
      //console.log('+++++ index asyncData')
      // Please check if you are on the server side before using req and res
      //if (process.server) {
      //  return { host: req.headers.host }
      //}
      return {
      }
    },

    data({ app, params, store }) { // Client and Server
      //console.log('+++++ index data')
      return {
      }
    },

    mounted() { // Client only
      //console.log('+++++ index MOUNTED')
      this.$store.dispatch('sitepages/fetch')
      this.$store.commit("page/setTitle", page.title)
    },

    computed: {
      content() {
        const sitepage = this.$store.getters['sitepages/get']('/')
        if (sitepage) {
          page.title = sitepage.title
          return sitepage.content
        }
        return ''
      }
    },
    methods: {
    },
    head() { // Server-side: doesn't change rendered items // Client: does
      //console.log('+++++ index head')
      return {
        title: page.title,
      }
    },
  }
</script>
