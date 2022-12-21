<template>
  <div>
    <Messages :error="error" :message="message" />
    <div v-html="content">
    </div>
  </div>
</template>

<script lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'
import { useSitePagesStore } from "~/stores/sitepages"
import api from '~/api'

export default {
  inject: { setLayoutMessage: {} },
  setup() {
    const authStore = useAuthStore()
    const miscStore = useMiscStore()
    const sitePagesStore = useSitePagesStore()

    return { authStore, miscStore, sitePagesStore }
  },

  data() {
    return {
      error: '',
      message: 'Please wait, logging you in...',
    }
  },
  async mounted() {
    this.setLayoutMessage()
    const runtimeConfig = useRuntimeConfig()
    let executeRecaptcha = null
    if (runtimeConfig.public.RECAPTCHA_BYPASS) {
      this.message = 'Recaptcha bypass'
    } else {
      executeRecaptcha = await useVueRecaptcha() // needs to be done before other await calls
    }

    await this.sitePagesStore.fetch()
    if (this.authStore.loggedin) {
      navigateTo('/panel')
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

    const resetpwdinfo = {
      reset: token,
    }
    try {
      let grecaptcha = ''
      if (runtimeConfig.public.RECAPTCHA_BYPASS) {
        grecaptcha = runtimeConfig.public.RECAPTCHA_BYPASS
      } else {
        if( executeRecaptcha){
          grecaptcha = await executeRecaptcha('login')
        }
      }
      resetpwdinfo.grecaptcharesponse = grecaptcha
      const res = await api.auth.login(resetpwdinfo)
      if (res.ret === 0) {
        this.authStore.setToken(res.token)
        const user = await api.auth.getuser()

        this.authStore.setUser(user.user)
        navigateTo('/account')
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
      return sitepage ? sitepage.content : ''
    },
  },
}
</script>
