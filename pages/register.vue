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
import { useSitePagesStore } from "~/stores/sitepages";
import Messages from '~/components/Messages.vue'
import UserAuthForm from '~/components/UserAuthForm.vue'
//import jwt_decode from 'jwt-decode'
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
      message: '',
    }
  },
  async mounted() {
    this.sitePagesStore.fetch() // Do not await as knackers useVueRecaptcha. WHY? TODO
    if (this.authStore.loggedin) {
      navigateTo('/panel');
    }
    this.miscStore.set({ key: 'page-title', value: 'Register' })
    const runtimeConfig = useRuntimeConfig()
    if (runtimeConfig.public.RECAPTCHA_BYPASS) {
      this.message = 'Recaptcha bypass'
    } else {
      this.grecaptcha = await useVueRecaptcha();
    }
  },

  computed: {
    content() {
      const sitepage = this.sitePagesStore.get('/register')
      return sitepage ? sitepage.content : '';
    },
  },
  methods: {
    async registerUser(registrationInfo: any) {
      this.error = ''
      this.message = ''
      if (this.grecaptcha == '') {
        this.error = 'Captcha not set'
        return
      }
      registrationInfo.grecaptcharesponse = this.grecaptcha
      try {
        let res = await this.api.auth.register(registrationInfo)
        if (res.ret !== 0) {
          this.error = res.status
          return
        }

        // Pass token to loginWith to stop duplicate recatcha validate
        registrationInfo.token = res.user.token
        res = await this.api.auth.login(registrationInfo)
        this.authStore.setToken(res.token)

        const user = await this.api.auth.getuser()
        this.authStore.setUser(user.user);

        navigateTo('/panel');
      }
      catch (err: any) {
        console.log("REGISTER FAIL", err.message)
        this.error = err.message
      }
    }
  }
}
</script>
