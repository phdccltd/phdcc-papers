<template>
  <!-- ADMIN SETUP PANEL FOR ONE PUBLICATION -->
  <!-- Access check: correctly fails as API returns error if not allowed -->
  <div>
    <b-alert v-if="fatalerror" variant="warning" :show="true">
      ERROR {{fatalerror}}
    </b-alert>
    <div v-else-if="!(pub.isowner || $auth.user.super)">
      You cannot administer this publication
    </div>
    <div v-else>
      <HelpAdminSetup />
      <Messages :error="error" :message="message" />
    </div>
  </div>
</template>

<script>
  const _ = require('lodash/core')
  import HelpAdminSetup from '~/components/HelpAdminSetup'
  import Messages from '~/components/Messages'
  
  import { page } from '@/utils/page'

  page.title = ''

  export default {
    middleware: 'authuser',
    components: { Messages, HelpAdminSetup },
    data({ app, params, store }) {
      //console.log('_id data')
      return {
        error: '',
        message: ''
      }
    },
    async mounted() { // Client only
      this.error = ''
      this.message = ''
      this.$store.dispatch('pubs/clearError')
      this.$store.dispatch('pubs/fetch')
    },
    computed: {
      pub() {
        const pub = this.$store.getters['pubs/getPub'](this.pubid)
        if (!pub) {
          this.setError('Invalid pubid')
          return false
        }
        page.title = pub.name
        document.title = pub.name
        this.$store.commit("page/setTitle", page.title)
        this.$store.commit("page/setTitleSuffix", 'ADMIN SETUP')
        return pub
      },
      fatalerror() {
        const error1 = this.$store.getters['users/error']
        return error1
      },
      pubid() {
        //console.log('PUB pubid')
        return parseInt(this.$route.params.pubid)
      }
    },
    methods: {
      /* ************************ */
      setError(msg) {
        this.error = msg
      },
      /* ************************ */
      setMessage(msg) {
        this.message = msg
      }
    },
    /* ************************ */
    head() {
      return {
        title: page.title,
      }
    },
  }
</script>
