<template>
  <!-- ADMIN PANEL FOR ONE PUBLICATION -->
  <div>
    <HelpAdmin />
    <Messages :error="error" :message="message" />
  </div>
</template>

<script>
  import HelpAdmin from '~/components/HelpAdmin'
  import Messages from '~/components/Messages'
  
  import { page } from '@/utils/phdcc'

  page.title = 'Publication admin'

  export default {
    middleware: 'authuser',
    components: { Messages, HelpAdmin },
    data({ app, params, store }) {
      //console.log('_id data')
      return {
        error: '',
        message: '',
      }
    },
    async mounted() { // Client only
      page.title = 'Publication admin'
      console.log('ADMIN',this.pubid)
      this.error = ''
      this.message = ''
      //console.log('_id mounted', this.pubid)
    },
    computed: {
      pubid() {
        //console.log('PUB pubid')
        return parseInt(this.$route.params.pubid)
      },
    },
    methods: {
      setError(msg) {
        this.error = msg
      },
      setMessage(msg) {
        this.message = msg
      }
    },
    head() {
      return {
        title: page.title,
      }
    },
  }
</script>
