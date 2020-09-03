<template>
  <div>
    <div class="container">
      <div class="border border-primary rounded p-3">
        <div class="float-right">
          <div v-if="$auth.loggedIn">
            <b-btn to="/account" variant="outline-secondary" class="mr-2">{{ $auth.user.name }}</b-btn>
            <b-btn @click="logout()" variant="outline-secondary" class="mr-2" title="Logout">
              <v-icon name="sign-out-alt" scale="1" /><br/>
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
        <b-btn to="/admin" variant="outline-primary" class="mr-2" v-if="$auth.user && $auth.user.super">Users</b-btn>
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
      <a href="https://www.phdcc.com/papers/">Papers {{ version }}</a>.
      Your time: {{ yourtime }} - Copyright &copy; 2020 PHD Computer Consultants Ltd, 
    </div>
  </div>
</template>

<script>
  import { page } from '@/utils/phdcc'
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
        this.$auth.logout()
        //window.localStorage.removeItem('papers')
        this.$store.dispatch('misc/clear')
        this.$router.push('/')
      },
    }
  }

</script>

<style>
  .menu-title {
    font-size: 1.5rem;
    font-weight: bold;
    display: inline;
    white-space: nowrap;
  }


</style>
