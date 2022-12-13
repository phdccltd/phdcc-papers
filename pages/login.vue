<template>
  <div>
    <!-- MOSTLY DONE -->
    <Messages :error="error" :message="message" />
    <div v-html="content">
    </div>
    <UserAuthForm buttonText="Login" :submitForm="loginUser" v-bind:isRegister="false" />
  </div>
</template>

<script lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'
import { useSitePagesStore } from "~/stores/sitepages";
import Messages from '~/components/Messages.vue'
import UserAuthForm from '~/components/UserAuthForm.vue'
//import jwt_decode from 'jwt-decode'
import api from '~/api'

export default {
  setup() {
    const authStore = useAuthStore()
    const miscStore = useMiscStore()
    const sitePagesStore = useSitePagesStore()
    const runtimeConfig = useRuntimeConfig()

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
    const runtimeConfig = useRuntimeConfig()
    if (runtimeConfig.public.RECAPTCHA_BYPASS) {
      this.message = 'Recaptcha bypass'
    } else {
      this.executeRecaptcha = await useVueRecaptcha(); // needs to be done before other await calls
    }

    await this.sitePagesStore.fetch()
    if (this.authStore.loggedin) {
      navigateTo('/panel');
    }
    this.miscStore.set({ key: 'page-title', value: 'Login' })
  },

  computed: {
    content() {
      const sitepage = this.sitePagesStore.get('/login')
      return sitepage ? sitepage.content : '';
    },
  },
  methods: {
    async loginUser(loginInfo: any) {
      this.error = ''
      this.message = ''
      const runtimeConfig = useRuntimeConfig()
      let grecaptcha = ''
      if (runtimeConfig.public.RECAPTCHA_BYPASS) {
        grecaptcha = runtimeConfig.public.RECAPTCHA_BYPASS
      } else {
        if( this.executeRecaptcha){
          grecaptcha = await this.executeRecaptcha('login');
        }
      }

      if (grecaptcha == '') {
        this.error = 'Captcha not set'
        return
      }
      loginInfo.grecaptcharesponse = grecaptcha

      const res = await api.auth.login(loginInfo)
      if (res.ret !== 0) {
        this.error = res.status
        return
      }
      //const ppuser = jwt_decode(res.token)
      //console.log("===PPUSER",ppuser)
      this.authStore.setToken(res.token)

      const user = await api.auth.getuser()
      this.authStore.setUser(user.user);

      navigateTo('/panel');
    }
  }
}
</script>
