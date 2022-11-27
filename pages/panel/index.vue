<template>
  <div>
    <!-- MAIN PANEL SHOWING ALL PUBLICATIONS -->
    <HelpHome />
  </div>
</template>
<script lang="ts">
import { useSitePagesStore } from "~/stores/sitepages";
import { useAuthStore } from '~/stores/auth'
import Messages from '~/components/Messages.vue'
//import HelpHome from '~/components/HelpHome.vue'
import { default as api2 } from '~/api'

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
}
</script>  