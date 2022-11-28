<template>
  <div>
    <!-- MOSTLY DONE -->
    <Messages :error="error" :message="message" />
    <div v-html="content">
    </div>
  </div>
</template>

<script lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'
import { useSitePagesStore } from "~/stores/sitepages";
import Messages from '~/components/Messages.vue'
import { default as api2 } from '~/api'

export default {
  setup() {
    const authStore = useAuthStore()
    const miscStore = useMiscStore()
    const sitePagesStore = useSitePagesStore()
    const runtimeConfig = useRuntimeConfig()
    const grecaptcha = ref(runtimeConfig.public.RECAPTCHA_BYPASS);

    const api = api2()

    return { api, authStore, miscStore, sitePagesStore, grecaptcha }
  },

  data() {
    return {
      error: '',
      message: 'Please wait, logging you in...',
    }
  },
  async mounted() {
    this.sitePagesStore.fetch() // Do not await as knackers useVueRecaptcha. WHY? TODO
    if (this.authStore.loggedin) {
      navigateTo('/panel');
    }
    this.miscStore.set({ key: 'page-title', value: 'Reset password' })

    let token: string | boolean = false
    if (window.location.search) {
      if (window.location.search.substring(0, 1) === '?') {
        token = window.location.search.substring(1)
      }
    }
    if (!token) {
      this.error = 'Invalid reset password request'
      this.message = ''
      return
    }

    const runtimeConfig = useRuntimeConfig()
    if (runtimeConfig.public.RECAPTCHA_BYPASS) {
      this.message = 'Recaptcha bypass'
    } else {
      this.grecaptcha = await useVueRecaptcha();
    }

    const resetpwdinfo = {
      reset: token,
    }
    try {
      resetpwdinfo.grecaptcharesponse = this.grecaptcha
      const res = await this.api.auth.login(resetpwdinfo)
      if (res.ret === 0) {
        this.authStore.setToken(res.token)
        const user = await this.api.auth.getuser()

        this.authStore.setUser(user.user);
        navigateTo('/account');
      } else {
        this.error = res.status
        this.message = ''
      }
    }
    catch (err: any) {
      console.log("RESET FAIL", err.message)
      this.error = err.message
      this.message = ''
    }
  },

  computed: {
    content() {
      const sitepage = this.sitePagesStore.get('/resetpwd')
      return sitepage ? sitepage.content : '';
    },
  },
}
</script>
