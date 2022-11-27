<template>
  <div>
    <!-- MOSTLY DONE -->
    <Messages :error="error" :message="message" />
    <div v-html="content">
    </div>
  </div>
</template>

<script lang="ts">
import { useSitePagesStore } from "~/stores/sitepages";
import { useAuthStore } from '~/stores/auth'
import Messages from '~/components/Messages.vue'
//import { page } from '@/utils/page'
import { default as api2 } from '~/api'

//page.title = 'Reset password'

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
      message: 'Please wait, logging you in...',
    }
  },
  async mounted() {
    this.sitePagesStore.fetch() // Do not await as knackers useVueRecaptcha. WHY? TODO
    //page.title = 'Reset password'
    if (this.authStore.loggedin) {
      navigateTo('/panel');
    }
    //this.$store.commit("page/setTitle", page.title)

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

  //head() {
  //  return {
  //    title: page.title,
  //  }
  //},
  computed: {
    content() {
      const sitepage = this.sitePagesStore.get('/resetpwd')
      return sitepage ? sitepage.content : '';
    },
  },
}
</script>
