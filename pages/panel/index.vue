<template>
  <div>
    <!-- MAIN PANEL SHOWING ALL PUBLICATIONS -->
    <HelpHome />
    <b-alert v-if="fatalerror" variant="warning" :show="true">
      ERROR {{ fatalerror }}
    </b-alert>
    <div v-else>
      <Messages :error="error" :message="message" />
      <h2>{{ subtitle }}</h2>
      <b-container v-for="(pub, index) in pubs" :key="index" class="mt-2 pl-0">
        <b-row no-gutters
          :class="'p-2 ' + (pub.owner ? 'pub-owner' : (pub.notowner ? 'pub-notowner' : (issuper ? 'pub-super' : 'pub-weird')))">
          <b-col sm="3">
            <b-button variant="outline-primary" :to="'/panel/' + pub.id">
              {{ pub.name }}
            </b-button>
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
<script lang="ts">
import { useSitePagesStore } from "~/stores/sitepages";
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'
import { usePubsStore } from '~/stores/pubs'
import Messages from '~/components/Messages.vue'
//import HelpHome from '~/components/HelpHome.vue'

definePageMeta({
  middleware: 'authuser',
})

export default {
  setup() {
    const authStore = useAuthStore()
    const miscStore = useMiscStore()
    const pubsStore = usePubsStore()
    const sitePagesStore = useSitePagesStore()
    const runtimeConfig = useRuntimeConfig()
    const grecaptcha = ref(runtimeConfig.public.RECAPTCHA_BYPASS);

    return { authStore, miscStore, pubsStore, sitePagesStore, grecaptcha }
  },
  data() { // Client and Server
    return {
      error: '',
      subtitle: '',
    }
  },
  async mounted() { // Client only
    let title = 'Publications'
    if( 'publicsettings' in this.authStore && 'pubscalled' in this.authStore.publicsettings) {
      title = this.authStore.publicsettings.pubscalled
      this.subtitle = 'Your ' + title.toLowerCase()
    }
    this.miscStore.set({ key: 'page-title', value: title })
    await this.pubsStore.clearError()
    await this.pubsStore.fetch()
  },
  

  computed: {
    message() {
      return 'Hello ' + this.authStore.username
    },
    fatalerror() {
      return this.pubsStore.error
    },
    issuper(){
      return this.authStore.super
    },
    pubs() {
      const pubs = this.pubsStore.pubs

      // Set apiversion here
      for (const pub in pubs) {
        this.miscStore.set({ key: 'apiversion', value: pubs[pub].apiversion })
        break
      }

      return pubs
    },
    nowtavailable() {
      const pubs = this.pubsStore.pubs
      let count = 0
      for (const pub in pubs) { count++ }
      return count === 0
    },
  }
}
</script>  