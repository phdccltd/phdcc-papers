<template>
  <div>
    <h2 class="subtitle">
      Publication abstract and paper submission and review system
    </h2>
    <div>
      <b-btn variant="outline-success" to="/panel">Panel</b-btn>
    </div>
  </div>
</template>

<script>
//import Logo from '~/components/Logo.vue'
  import { page } from '@/utils/phdcc'

  page.title = 'Welcome'

  export default {
    components: {
      //Logo,
    },

    fetch() {
      //console.log('+++++ index fetch...')
      // DEPRECATED The `fetch` method is used to fill the store before rendering the page
    },

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
    computed: {
    },
    mounted() { // Client only
      //console.log('+++++ index MOUNTED')
      this.$store.commit("page/setTitle", page.title)
    },

    head() { // Server-side: doesn't change rendered items // Client: does
      //console.log('+++++ index head')
      return {
        title: page.title,
      }
    },
    methods: {
    }
  }
</script>

<style>
</style>
