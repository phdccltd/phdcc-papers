<template>
  <div>
    <Html>

    <Head>
      <Title>{{ title }}</Title>
    </Head>

    </Html>
    <div :class="'container' + (issuper ? ' header-super' : ismasquerading ? ' header-masquerading' : '')">
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
        <h1 class="menu-title" data-cy="layout-h1">
          <nuxt-link v-if="pubid" :to="'/panel/' + pubid" data-cy="layout-h1-a">{{ title }}</nuxt-link>
          <span v-else>
            {{ title }}
          </span>
          {{ titlesuffix }}
        </h1>
      </div>
    </div>
    <div class="container">
      <b-alert variant="warning" :modelValue="layoutmessage.length > 0" class="mt-2">
        {{ layoutmessage }}
      </b-alert>
      <slot />
    </div>
    <div class="container mt-3 pt-2 border-top" style="color: gray">
      <a href="https://www.phdcc.com/papers/">Papers {{ version }}/{{ apiversion }}</a>,
      <span style="color: lightgrey"> built: {{ BUILD_DATE }}. Copyright &copy; 2023 PHD Computer Consultants Ltd. </span><br />
      <a href="https://www.phdcc.com/feedback.html" target="_blank" rel="noopener">
        Get in touch if you want to try out Papers for your conference or journal.
      </a>
    </div>
  </div>
</template>

<script lang="ts">

import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'
import { usePubsStore } from '~/stores/pubs'
import { useSubmitsStore } from '~/stores/submits'
import { useUsersStore } from '~/stores/users'

export default {
  setup() {
    const authStore = useAuthStore()
    const miscStore = useMiscStore()
    const pubsStore = usePubsStore()
    const submitsStore = useSubmitsStore()
    const usersStore = useUsersStore()
    return { authStore, miscStore, pubsStore, submitsStore, usersStore }
  },
  data: function () {
    return {
      layoutmessage: ''
    }
  },
  mounted() {
  },
  provide() {
    const me = this
    return {
      setLayoutMessage(msg?: string) {
        if (msg && msg.length > 0) {
          me.miscStore.set({ key: 'message', value: msg })
          me.layoutmessage = msg
        }
        else {
          const startmessage = me.miscStore.get('message')
          if (startmessage && startmessage.length > 0) {
            me.layoutmessage = startmessage
            me.miscStore.set({ key: 'message', value: '' })
          } else {
            me.layoutmessage = ''
          }
        }
      }
    }
  },
  computed: {
    // Client and Server
    yourtime() {
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
      return this.miscStore.get('apiversion')
    },
    title() {
      return this.miscStore.get('page-title')
    },
    titlesuffix() {
      return this.miscStore.get('page-title-suffix')
    },
    loggedin() {
      return this.authStore.loggedin
    },
    ismasquerading() {
      return this.authStore.masquerading
    },
    issuper() {
      return this.authStore.super
    },
    username() {
      return this.authStore.name
    },
    pubid() {
      const route = useRoute()
      const path = '/' + route.params.id
      if ('pubid' in route.params) {
        return parseInt(route.params.pubid)
      }
      else
        return false
    },
  },
  methods: {
    async logout() {
      await this.authStore.logout()
      this.miscStore.clearAll()
      this.pubsStore.clearAll()
      this.submitsStore.clearAll()
      this.usersStore.clearAll()
      navigateTo('/')
    },
  }
}
</script>

<style scoped lang="scss">
@import '~bootstrap/scss/functions';
@import '~bootstrap/scss/variables';
@import '~bootstrap/scss/mixins/_breakpoints';
</style>

<style>
.menu-title {
  font-size: 1.5rem;
  font-weight: bold;
  display: inline;
  /*white-space: nowrap;*/
}
</style>
