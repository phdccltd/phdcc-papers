<template>
  <!-- MAIN PANEL SHOWING ALL PUBLICATIONS -->
  <div>
    <HelpHome />
    <b-alert v-if="fatalerror" variant="warning" :show="true">
      ERROR {{fatalerror}}
    </b-alert>
    <div v-else>
      <Messages :error="error" :message="message" />
      <h2>{{ subtitle }}</h2>
      <b-container v-for="(pub, index) in pubs" :key="index" class="mt-2 pl-0">
        <b-row no-gutters>
          <b-col sm="3">
            <b-btn variant="outline-primary" :to="'/panel/'+pub.id">
              {{ pub.name }}
            </b-btn>
          </b-col>
          <b-col sm="2">
            {{ pub.startdate }}
          </b-col>
          <!--b-col sm="2">
            {{ pub.tz }}
          </b-col-->
        </b-row>
      </b-container>
      <div v-if="nowtavailable">
        Nothing available
      </div>
    </div>
  </div>
</template>

<script>
  import { page } from '@/utils/phdcc'
  import Messages from '~/components/Messages'
  import HelpHome from '~/components/HelpHome'

  page.title = 'Publications'

  export default {
    middleware: 'authuser',
    components: {
      Messages,
      HelpHome,
    },

    /*async asyncData({ req, res }) { // this (component) not available
      //console.log('panel index asyncData')
      // Please check if you are on the server side before using req and res
      //if (process.server) {
      //  return { host: req.headers.host }
      //}
      return {}
    }, */

    data({ app, params, store }) { // Client and Server
      //console.log('PANEL data')
      if ('publicsettings' in this.$auth.user && 'pubscalled' in this.$auth.user.publicsettings) {
        page.title = this.$auth.user.publicsettings.pubscalled
      }
      const subtitle = 'Your ' + page.title.toLowerCase()
      //console.log('panel index data')
      return {
        error: '',
        subtitle,
      }
    },

    mounted() { // Client only
      this.error = ''
      //console.log('PANEL MOUNTED')
      this.$store.dispatch('pubs/fetch')
      this.$store.commit("page/setTitle", page.title)
    },

    computed: {
      pubs() {
        return this.$store.getters['pubs/get']
      },
      nowtavailable() {
        const pubs = this.$store.getters['pubs/get']
        return pubs.length === 0
      },
      message() {
        return 'Hello ' + this.$auth.user.name
      },
      fatalerror() {
        return this.$store.getters['pubs/error']
      },
    },

    methods: {
    },

    head() {
      return {
        title: page.title,
      }
    },
  }
</script>

<style>
</style>
