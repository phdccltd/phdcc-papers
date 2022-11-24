<template>
  <div>
    <div class="container">
      <div class="border border-primary rounded p-3">
        <div class="float-end">
          <div v-if="loggedin">
            <b-button @click="logout()" variant="outline-secondary" class="mr-2" title="Logout">
              <v-icon icon="sign-out-alt" scale="1" /><br />
            </b-button>
          </div>
          <div v-else>
            <b-button @click="login()" variant="outline-success">IN</b-button>
            <b-button variant="outline-success" to="/login">Login</b-button>
            <b-button variant="outline-secondary" to="/register">Register</b-button>
          </div>
        </div>
        <b-button variant="outline-secondary" class="mr-2" to="/" v-if="!loggedin" title="Home">
          <v-icon icon="home" scale="1" />
        </b-button>
        <b-button variant="outline-secondary" class="mr-2" to="/panel" v-if="loggedin" title="Control Panel">
          <v-icon icon="home" scale="1" />
        </b-button>
        <h1 class="menu-title">
          {{ title }}
          {{ titlesuffix }}
          {{id}}
        </h1>
      </div>
    </div>
    <div class="container">
      <slot />
    </div>
    <div class="container mt-3 pt-2 border-top" style="color: gray">
      <a href="https://www.phdcc.com/papers/">Papers {{ version }}/{{ apiversion }}</a
      >, <span style="color: lightgrey"> built: {{ BUILD_DATE }}. Copyright &copy; 2022 PHD Computer Consultants Ltd. </span><br />
      <a href="https://www.phdcc.com/feedback.html" target="_blank" rel="noopener"
        >Get in touch if you want to try out Papers for your conference or journal.</a
      >
    </div>
  </div>
</template>

<script lang="ts">

import { useMiscStore } from "~/stores/misc";

// console.log("DEFAULTS.VUE")
export default {
  setup() {
    const miscStore = useMiscStore()
    const id = 12345678;
    return { id, miscStore }
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
      return 'API1x'
      // return this.$store.getters['misc/get']('apiversion')
    },
    title() {
      return 'Page title'
    },
    titlesuffix() {
      return 'suffix'
      // return this.$store.getters['page/titlesuffix'] // as changes reactively as we move about
    },
    loggedin(){
      return this.miscStore.get('isloggedin')
    },
  },
  methods: {
    login(){
      this.miscStore.set({
          key: 'isloggedin',
          value: true,
        })
    },
    logout(){
      this.miscStore.set({
          key: 'isloggedin',
          value: false,
        })
    }
    }
}
</script>

<style scoped lang="scss">
@import '~bootstrap/scss/functions';
@import '~bootstrap/scss/variables';
@import '~bootstrap/scss/mixins/_breakpoints';
</style>
