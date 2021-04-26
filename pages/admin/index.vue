<template>
  <!-- SUPER-ADMIN PAGE -->
  <div>
    <HelpAdmin />
    <Messages :error="error" :message="message" />
  </div>
</template>

<script>
  import { page } from '@/utils/phdcc'
  import Messages from '~/components/Messages'
  import HelpAdmin from '~/components/HelpAdmin'

  page.title = 'Site admin'

  export default {
    middleware: 'authsuper',
    components: { Messages, HelpAdmin },

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
      this.$store.commit("page/setTitle", page.title)
      document.title = page.title
    },

    computed: {
    },

    methods: {
    },

    head() {
      return {
        title: page.title,
      }
    }
  }
</script>

