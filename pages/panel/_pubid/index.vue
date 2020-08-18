<template>
  <!-- OVERVIEW PANEL FOR ONE PUBLICATION -->
  <div>
    <HelpPanel />
    <Messages :error="error" :message="message" />
    <PublicationSubmissions :pubid="pubid" :setError="setError" :setMessage="setMessage" />
  </div>
</template>

<script>
  import HelpPanel from '~/components/HelpPanel'
  import Messages from '~/components/Messages'
  import PublicationSubmissions from '~/components/PublicationSubmissions'
  
  import { page } from '@/utils/phdcc'

  page.title = ''

  export default {
    middleware: 'authuser',
    components: { Messages, HelpPanel, PublicationSubmissions },
    data({ app, params, store }) {
      //console.log('_id data')
      return {
        error: '',
        message: '',
      }
    },
    async mounted() { // Client only
      this.error = ''
      this.message = ''
      //console.log('_id mounted', this.pubid)
      this.$store.dispatch('pubs/fetch')
      this.$store.dispatch('submits/fetchpub', this.pubid)
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
