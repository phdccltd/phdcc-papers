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
        <b-row no-gutters :class="'p-2 '+(pub.owner?'pub-owner':(pub.notowner?'pub-notowner':($auth.user.super?'pub-super':'pub-weird')))">
          <b-col sm="3">
            <b-btn variant="outline-primary" :to="'/panel/'+pub.id">
              {{ pub.name }}
            </b-btn>
          </b-col>
          <b-col sm="9">
            <b-badge v-if="!pub.enabled" pill variant="danger">DISABLED FOR USERS</b-badge>
            <br v-if="!pub.enabled" />
            {{ pub.description }}
          </b-col>
        </b-row>
      </b-container>
      <div v-if="nowtavailable">
        Nothing available
      </div>
    </div>
  </div>
</template>

<script>
  import { page } from '@/utils/page'
  import Messages from '~/components/Messages'
  import HelpHome from '~/components/HelpHome'
  import { BBadge } from 'bootstrap-vue'

  page.title = 'Publications'

  export default {
    middleware: 'authuser',
    components: { Messages, HelpHome, BBadge },

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
      this.$store.dispatch('pubs/clearError')
      this.$store.dispatch('pubs/fetch')
      this.$store.commit("page/setTitle", page.title)
    },

    computed: {
      pubs() {
        const pubs = this.$store.getters['pubs/get']

        // Set apiversion here
        for (const pub in pubs) {
          this.$store.dispatch('misc/set', { key: 'apiversion', value: pubs[pub].apiversion })
          break
        }

        return pubs
      },
      nowtavailable() {
        const pubs = this.$store.getters['pubs/get']
        let count = 0
        for (const pub in pubs) { count++ }
        return count === 0
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
