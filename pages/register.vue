<template>
  <div>
    <Messages :error="error" :message="message" />
    <div v-html="content">
    </div>
    <UserAuthForm buttonText="Register" :submitForm="registerUser" v-bind:isRegister="true" />
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
      message: '',
      executeRecaptcha: null,
    }
  },
  async mounted() {
    this.setLayoutMessage()
    const runtimeConfig = useRuntimeConfig()
    if (runtimeConfig.public.RECAPTCHA_BYPASS) {
      this.message = 'Recaptcha bypass'
    } else {
      this.executeRecaptcha = await useVueRecaptcha() // needs to be done before other await calls
    }

    await this.sitePagesStore.fetch()
    if (this.authStore.loggedin) {
      navigateTo('/panel')
    }
    this.miscStore.set({ key: 'page-title', value: 'Register' })
},

  computed: {
    content() {
      const sitepage = this.sitePagesStore.get('/register')
      return sitepage ? sitepage.content : ''
    },
  },
  methods: {
    async registerUser(registrationInfo: any) {
      this.error = ''
      this.message = ''
      const runtimeConfig = useRuntimeConfig()
      let grecaptcha = ''
      if (runtimeConfig.public.RECAPTCHA_BYPASS) {
        grecaptcha = runtimeConfig.public.RECAPTCHA_BYPASS
      } else {
        if (this.executeRecaptcha) {
          grecaptcha = await this.executeRecaptcha('login')
        }
      }
      if (grecaptcha == '') {
        this.error = 'Captcha not set'
        return
      }
      registrationInfo.grecaptcharesponse = grecaptcha
      try {
        let res = await api.auth.register(registrationInfo)
        if (res.ret !== 0) {
          this.error = res.status
          return
        }

        // Pass token to loginWith to stop duplicate recatcha validate
        registrationInfo.token = res.user.token
        res = await api.auth.login(registrationInfo)
        this.authStore.setToken(res.token)

        const user = await api.auth.getuser()
        this.authStore.setUser(user.user)

        navigateTo('/panel')
      }
      catch (err: any) {
        console.log("REGISTER FAIL", err.message)
        this.error = err.message
      }
    }
  }
}
</script>
