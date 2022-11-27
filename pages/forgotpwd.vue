<template>
  <div>
    <!-- MOSTLY DONE -->
    <Messages :error="error" :message="message" />
    <div v-html="content">
    </div>
    <b-form @submit="onSubmit" @submit.stop.prevent>
      <b-form-group label="Email address:" label-cols-sm="3" label-for="email">
        <b-form-input id="email" v-model="form.email" type="email" required placeholder="Enter email"></b-form-input>
      </b-form-group>
      <b-row no-gutters>
        <b-col cols="9" offset-md="3">
          <b-button :disabled="requested" type="submit" variant="primary">
            Email login link
            <v-icon v-if="requested" icon="check-circle" scale="1" class="ml-1" />
          </b-button>
        </b-col>
      </b-row>
    </b-form>
  </div>
</template>

<script lang="ts">
import { useSitePagesStore } from "~/stores/sitepages";
import { useAuthStore } from '~/stores/auth'
// http://sahatyalkabov.com/how-to-implement-password-reset-in-nodejs/
import Messages from '~/components/Messages.vue'
//import { page } from '@/utils/page'
import { default as api2 } from '~/api'

//page.title = 'Forgot password'

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
      requested: false,
      form: {
        email: '',
      },
    }
  },
  async mounted() {
    this.sitePagesStore.fetch()
    /*this.$store.dispatch('sitepages/fetch')
    page.title = 'Forgot password'
    if (this.$auth.loggedIn) {
      this.$router.push('/panel')
      return
    }
    this.$store.commit("page/setTitle", page.title)*/
    if (this.authStore.loggedin) {
      navigateTo('/panel');
    }
        const runtimeConfig = useRuntimeConfig()
    if (runtimeConfig.public.RECAPTCHA_BYPASS) {
      this.message = 'Recaptcha bypass'
    } else {
      this.grecaptcha = await useVueRecaptcha();
    }
  },

  /*head() {
    return {
      title: page.title,
    }
  },*/
  computed: {
    content() {
      const sitepage = this.sitePagesStore.get('/forgotpwd')
      return sitepage ? sitepage.content : '';
    },
  },
  methods: {
    async onSubmit(evt: any) {
      console.log('this.form', this.form)
      this.error = ''
      this.message = ''
      if (this.grecaptcha == '') {
        this.error = 'Captcha not set'
        return
      }
      this.form.grecaptcharesponse = this.grecaptcha
      try {
        const forgotten = await this.api.auth.forgotpwd(this.form)
        //console.log("forgotten", forgotten)
        if (forgotten.err) {
          this.error = forgotten.err
          return
        }
        this.message = forgotten.msg
        this.requested = true
      }
      catch (err: any) {
        console.log("FORGOTPWD FAIL", err)
        this.error = err.message
      }
    }

  }
}
</script>
