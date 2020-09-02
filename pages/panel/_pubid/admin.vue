<template>
  <!-- ADMIN PANEL FOR ONE PUBLICATION -->
  <div>
    <b-alert v-if="fatalerror" variant="warning" :show="true">
      ERROR {{fatalerror}}
    </b-alert>
    <div v-else>
      <HelpAdmin />
      <Messages :error="error" :message="message" />
      <b-list-group class="pubusers">
        <b-list-group-item v-for="(pubuser, index) in pubusers" :key="index" class="pubuser">
        </b-list-group-item>
      </b-list-group>
    </div>
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
      this.message = 'CHECK I AM ALLOWED'
      this.$store.dispatch('users/clearError')
      this.$store.dispatch('users/fetchpubusers', this.pubid)
    },
    computed: {
      fatalerror() {
        const error1 = this.$store.getters['users/error']
        return error1
      },
      pubid() {
        //console.log('PUB pubid')
        return parseInt(this.$route.params.pubid)
      },
      pubusers() {
        const pubusers = this.$store.getters['users/pubusers'](this.pubid)
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
