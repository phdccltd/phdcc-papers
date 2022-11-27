<template>
  <div>
    <div class="container">
      <div class="border border-primary rounded p-3">
        <div class="float-end">
          <div v-if="loggedin">
            <b-button to="/admin" v-if="issuper" variant="outline-danger" class="me-2">Super</b-button>
            <b-button to="/account" variant="outline-secondary" class="me-2">{{ username }}</b-button>
            <b-button @click="logout()" variant="outline-secondary" class="me-2" title="Logout">
              <v-icon icon="sign-out-alt" />
            </b-button>
          </div>
          <div v-else>
            <b-button variant="outline-success" to="/login" class="me-2">Login</b-button>
            <b-button variant="outline-secondary" to="/register" class="me-2">Register</b-button>
          </div>
        </div>
        <b-button variant="outline-secondary" class="me-2" to="/" v-if="!loggedin" title="Home">
          <v-icon icon="home" />
        </b-button>
        <b-button variant="outline-secondary" class="me-2" to="/panel" v-if="loggedin" title="Control Panel">
          <v-icon icon="home" />
        </b-button>
        <h1 class="menu-title">
          {{ title }}
          {{ titlesuffix }}
        </h1>
      </div>
    </div>
    <div class="container">
      <slot />
    </div>
    <div class="container mt-3 pt-2 border-top" style="color: gray">
      <a href="https://www.phdcc.com/papers/">Papers {{ version }}/{{ apiversion }}</a>, 
      <span style="color: lightgrey"> built: {{ BUILD_DATE }}. Copyright &copy; 2022 PHD Computer Consultants Ltd. </span><br />
      <a href="https://www.phdcc.com/feedback.html" target="_blank" rel="noopener">
        Get in touch if you want to try out Papers for your conference or journal.
        </a>
      <br/>
      {{yourtime}}
    </div>
  </div>
</template>

<script lang="ts">

import { useAuthStore } from '~/stores/auth'

export default {
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  computed: {
    // Client and Server
    yourtime() {
      // console.log('====== layout computed yourtime')
      const now = new Date()
      return now.toLocaleString()
    },
    version() {
      const runtimeConfig = useRuntimeConfig()
      return runtimeConfig.public.VERSION
    },
    BUILD_DATE() {
      const runtimeConfig = useRuntimeConfig()
      return runtimeConfig.public.BUILD_DATE
    },
    apiversion() {
      // console.log('GET APIVERSION')
      //return this.miscStore.get('apiversion')
      return 'APIVER'
    },
    title() {
      return 'Page title'
    },
    titlesuffix() {
      return 'suffix'
      // return this.$store.getters['page/titlesuffix'] // as changes reactively as we move about
    },
    loggedin(){
      return this.authStore.loggedin
    },
    issuper(){
      return this.authStore.super
    },
    username(){
      return this.authStore.name
    }
  },
  methods: {
    logout(){
      this.authStore.logout()
      navigateTo('/');
    }
    }
}
</script>

<style scoped lang="scss">
@import '~bootstrap/scss/functions';
@import '~bootstrap/scss/variables';
@import '~bootstrap/scss/mixins/_breakpoints';
</style>
