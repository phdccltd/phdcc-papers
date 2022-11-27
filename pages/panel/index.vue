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
    </div>
  </div>
</template>
<script lang="ts">
import { useSitePagesStore } from "~/stores/sitepages";
import { useAuthStore } from '~/stores/auth'
import Messages from '~/components/Messages.vue'
//import HelpHome from '~/components/HelpHome.vue'
import { default as api2 } from '~/api'

definePageMeta({
  middleware: 'authuser',
})

export default {
  //middleware: 'authuser',
  setup() {
    const sitePagesStore = useSitePagesStore()
    const authStore = useAuthStore()
    const runtimeConfig = useRuntimeConfig()
    const grecaptcha = ref(runtimeConfig.public.RECAPTCHA_BYPASS);

    const api = api2()

    return { api, authStore, sitePagesStore, grecaptcha }
  },
  data() { // Client and Server
    //console.log('PANEL data')
    //if ('publicsettings' in this.$auth.user && 'pubscalled' in this.$auth.user.publicsettings) {
    //    page.title = this.$auth.user.publicsettings.pubscalled
    //}
    //const subtitle = 'Your ' + page.title.toLowerCase()
    const subtitle = 'Your stuff'
    //console.log('panel index data')
    return {
      error: '',
      subtitle,
    }
  },
  computed: {
    message() {
      return 'Hello '+this.authStore.username
    },
    fatalerror() {
      return false // TODO
      //return this.$store.getters['pubs/error']
    },
  }
}
</script>  