<template>
  <div>
    <!--HelpHome /-->
    <Messages :error="error" :message="message" />
    <h2>{{ subtitle }}</h2>
    <b-container v-for="(pub, index) in pubs" :key="index" class="mt-2 pl-0">
      <b-row no-gutters>
        <b-col sm="3">
          <b-btn variant="outline-success" :to="'/panel/'+pub.id">
            {{ pub.name }}
          </b-btn>
        </b-col>
        <b-col sm="2">
          {{ pub.startdate }}
        </b-col>
        <b-col sm="2">
          {{ pub.tz }}
        </b-col>
      </b-row>
    </b-container>
    <div v-if="nowtavailable">
      Nothing available
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

    async asyncData({ req, res }) { // this (component) not available
      //console.log('panel index asyncData')
      // Please check if you are on the server side before using req and res
      //if (process.server) {
      //  return { host: req.headers.host }
      //}
      return {}
    },

    data({ app, params, store }) {
      if ('publicsettings' in this.$auth.user && 'pubscalled' in this.$auth.user.publicsettings) {
        page.title = this.$auth.user.publicsettings.pubscalled
      }
      const subtitle = 'Your ' + page.title.toLowerCase()
      //console.log('panel index data')
      return {
        pubs: [],
        subtitle,
        error: '',
        message: '',
        nowtavailable: false,
      }
    },
    computed: {
    },
    async mounted() {
      //console.log('index MOUNTED')
      try {
        this.$store.commit("page/setTitle", page.title)
        const { pubs } = await this.$api.pub.fetch()
        if (!pubs) throw new Error('pubs not returned')
        //console.log(pubs)
        this.pubs = pubs
        if (this.pubs.length === 0) this.nowtavailable = true
        this.message = 'Hello ' + this.$auth.user.name
      } catch (e) {
        this.error = e.message
      }
    },

    head() {
      return {
        title: page.title,
      }
    },
    methods: {
    },
    computed: {
    }
  }
</script>

<style>
</style>
