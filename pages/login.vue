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
import { useSitePagesStore } from "~/stores/sitepages";
import { useAuthStore } from '~/stores/auth'
import Messages from '~/components/Messages.vue'
import UserAuthForm from '~/components/UserAuthForm.vue'
//import { page } from '@/utils/page'
//import jwt_decode from 'jwt-decode'
import { default as api2 } from '~/api'

//page.title = 'Login'

export default {
  setup() {
    const sitePagesStore = useSitePagesStore()
    const authStore = useAuthStore()
    const runtimeConfig = useRuntimeConfig()
    const grecaptcha = ref(runtimeConfig.public.RECAPTCHA_BYPASS);

    const api = api2()

    return { api, authStore, sitePagesStore, grecaptcha }
  },

  data() {
    return {
      error: '',
      message: '',
    }
  },

  async mounted() {
    this.sitePagesStore.fetch()

    if (this.authStore.loggedin) {
      navigateTo('/panel');
    }
    /*this.$store.dispatch('sitepages/fetch')
    page.title = 'Login'*/
    //this.$store.commit("page/setTitle", page.title)
    const runtimeConfig = useRuntimeConfig()
    if (runtimeConfig.public.RECAPTCHA_BYPASS) {
      this.message = 'Recaptcha bypass'
    } else {
      this.grecaptcha = await useVueRecaptcha();
    }
  },

  computed: {
    content() {
      const sitepage = this.sitePagesStore.get('/login')
      return sitepage ? sitepage.content : '';
    },
  },
  methods: {
    async loginUser(loginInfo: any) {
      console.log("loginUser")
      console.log("===", loginInfo)
      this.error = ''
      this.message = ''
      if (this.grecaptcha == '') {
        this.error = 'Captcha not set'
        return
      }
      loginInfo.grecaptcharesponse = this.grecaptcha

      const res = await this.api.auth.login(loginInfo)
      if (res.ret !== 0) {
        this.error = res.status
        return
      }
      //const ppuser = jwt_decode(res.token)
      //console.log("===PPUSER",ppuser)
      this.authStore.setToken(res.token)

      const user = await this.api.auth.getuser()
      this.authStore.setUser(user.user);

      navigateTo('/panel');
    }
  }
}
</script>
