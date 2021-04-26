<template>
  <!-- SUPER-ADMIN PAGE -->
  <div>
    <HelpSuper />
    <Messages :error="error" :message="message" />
    <div class="mt-2">
      <b-btn variant="outline-success" to="/admin/site-pages" class="ml-2">Site pages</b-btn>
    </div>
  </div>
</template>

<script>
  import { page } from '@/utils/page'
  import Messages from '~/components/Messages'
  import HelpSuper from '~/components/HelpSuper'

  const pagetitle = 'Site admin'
  page.title = pagetitle

  export default {
    middleware: 'authsuper',
    components: { Messages, HelpSuper },

    data({ app, params, store }) {
      return {
        error: '',
        message: '',
      }
    },

    mounted() {
      this.error = ''
      this.message = ''
      this.$store.dispatch('pubs/clearError')
      this.$store.dispatch('pubs/fetch')
      this.$store.commit("page/setTitle", pagetitle)
      document.title = pagetitle
      page.title = pagetitle
    },

    computed: {
    },

    methods: {
    },

    head() {
      return {
        title: pagetitle
      }
    }
  }
</script>

