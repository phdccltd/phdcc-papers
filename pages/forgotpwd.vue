<template>
  <div>
    <!-- MOSTLY DONE -->
    <Messages :error="error" :message="message" />
    <div v-html="content">
    </div>
    <b-form @submit="onSubmit" @submit.stop.prevent>
      <b-form-group label="Email address:" label-cols-sm="3" label-for="email" state="true">
        <b-form-input id="email" v-model="form.email" type="email" required placeholder="Enter email"></b-form-input>
      </b-form-group>
      <b-row no-gutters>
        <b-col cols="9" offset-md="3">
          <b-button :disabled="requested" type="submit" variant="primary">
            Email login link
            <v-icon v-if="requested" icon="check-circle" class="ms-1" />
          </b-button>
        </b-col>
      </b-row>
    </b-form>
  </div>
</template>

<script lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'
import { useSitePagesStore } from "~/stores/sitepages"
// http://sahatyalkabov.com/how-to-implement-password-reset-in-nodejs/
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
      requested: false,
      form: {
        email: '',
      },
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
    this.miscStore.set({ key: 'page-title', value: 'Forgot password' })
    if (this.authStore.loggedin) {
      navigateTo('/panel')
    }
  },

  computed: {
    content() {
      const sitepage = this.sitePagesStore.get('/forgotpwd')
      return sitepage ? sitepage.content : ''
    },
  },
  methods: {
    async onSubmit() {
      console.log('this.form', this.form)
      this.error = ''
      this.message = ''
      const runtimeConfig = useRuntimeConfig()
      let grecaptcha = ''
      if (runtimeConfig.public.RECAPTCHA_BYPASS) {
        grecaptcha = runtimeConfig.public.RECAPTCHA_BYPASS
      } else {
        if( this.executeRecaptcha){
          grecaptcha = await this.executeRecaptcha('login')
        }
      }
      if (grecaptcha == '') {
        this.error = 'Captcha not set'
        return
      }
      this.form.grecaptcharesponse = grecaptcha
      try {
        const forgotten = await api.auth.forgotpwd(this.form)
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
