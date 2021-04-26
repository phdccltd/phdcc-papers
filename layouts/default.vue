<template>
  <div>
    <div :class="'container'+($auth.user && $auth.user.super ? ' header-super' : $auth.user && $auth.user.masquerading ? ' header-masquerading':'')">
      <div class="border border-primary rounded p-3">
        <div class="float-right">
          <div v-if="$auth.loggedIn">
            <b-btn to="/admin" v-if="$auth.user.super" variant="outline-warning" class="mr-2">Super</b-btn>
            <b-btn to="/account" variant="outline-secondary" class="mr-2">{{ $auth.user.name }}</b-btn>
            <b-btn @click="logout()" variant="outline-secondary" class="mr-2" title="Logout">
              <v-icon name="sign-out-alt" scale="1" /><br />
            </b-btn>
          </div>
          <div v-else>
            <b-btn variant="outline-success" to="/login">Login</b-btn>
            <b-btn variant="outline-secondary" to="/register">Register</b-btn>
          </div>
        </div>
        <b-btn variant="outline-secondary" class="mr-2" to="/" v-if="!$auth.user" title="Home">
          <v-icon name="home" scale="1" />
        </b-btn>
        <b-btn variant="outline-secondary" class="mr-2" to="/panel" v-if="$auth.user" title="Control Panel">
          <v-icon name="home" scale="1" />
        </b-btn>
        <h1 class="menu-title">
          <nuxt-link v-if="pubid" :to="'/panel/'+pubid">{{ title }}</nuxt-link>
          <span v-else>
            {{ title }}
          </span>
          {{ titlesuffix }}
        </h1>
      </div>
    </div>
    <nuxt class="container" />
    <div class="container mt-3 pt-2 border-top" style="color:gray">
      <a href="https://www.phdcc.com/papers/">Papers {{ version }}/{{apiversion}}</a>,
      <span style="color:lightgrey">
        built: {{BUILD_DATE}}.
        Copyright &copy; 2021 PHD Computer Consultants Ltd.
      </span><br />
      <a href="https://www.phdcc.com/feedback.html" target="_blank" rel="noopener">Get in touch if you want to try out Papers for your conference or journal.</a>
    </div>
  </div>
</template>

<script>
  export default {
    // Note: asyncData NOT CALLED IN LAYOUT
    data() { // Client and Server
      return {
        pagemounted: false
      }
    },
    mounted() { // Only client
      this.pagemounted = true
    },
    computed: { // Client and Server
      yourtime() {
        //console.log('====== layout computed yourtime')
        const now = new Date()
        return now.toLocaleString()
      },
      version() {
        return process.env.VERSION
      },
      BUILD_DATE() {
        return process.env.BUILD_DATE
      },
      apiversion() {
        //console.log('GET APIVERSION')
        return this.$store.getters['misc/get']('apiversion')
      },
      title() {
        //if (this.pagemounted) {
          return this.$store.getters['page/title'] // as changes reactively as we move about
        //} else {
        //  return page.title
        //}
      },
      titlesuffix() {
        return this.$store.getters['page/titlesuffix'] // as changes reactively as we move about
      },
      pubid() {
        if ( 'pubid' in this.$route.params)
          return parseInt(this.$route.params.pubid)
        else
          return false
      },
    },
    methods: {
      logout() {
        console.log('logout')
        //window.localStorage.removeItem('papers')
        this.$store.dispatch('misc/clear')
        this.$store.dispatch('users/clear')
        this.$store.dispatch('submits/clear')
        this.$store.dispatch('pubs/clear')
        this.$nextTick(() => {
          this.$auth.logout()
          this.$router.push('/')
        })
      },
    }
  }

</script>

<style>
  .menu-title {
    font-size: 1.5rem;
    font-weight: bold;
    display: inline;
    /*white-space: nowrap;*/
  }


</style>
