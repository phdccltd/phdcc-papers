<template>
  <div>
    <!-- MOSTLY DONE -->
    <Messages :error="error" :message="message" />
    <div v-html="content">
    </div>
    <b-form @submit="onSubmit" @submit.stop.prevent>
      <b-form-group label="Email address:" label-cols-sm="3" label-for="email" :state="true">
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

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'
import { useSitePagesStore } from "~/stores/sitepages"
// http://sahatyalkabov.com/how-to-implement-password-reset-in-nodejs/
import api from '~/api'

const authStore = useAuthStore()
const miscStore = useMiscStore()
const sitePagesStore = useSitePagesStore()
const runtimeConfig = useRuntimeConfig()

const error = ref('')
const message = ref('')
const requested = ref(false)
const form = reactive({
  email: '',
})
const executeRecaptcha = ref(null)

const content = computed(() => {
  const sitepage = sitePagesStore.get('/forgotpwd')
  return sitepage ? sitepage.content : ''
})

const onSubmit = async () => {
  console.log('form', form)
  error.value = ''
  message.value = ''
  let grecaptcha = ''
  if (runtimeConfig.public.RECAPTCHA_BYPASS) {
    grecaptcha = runtimeConfig.public.RECAPTCHA_BYPASS
  } else {
    if (executeRecaptcha.value) {
      grecaptcha = await executeRecaptcha.value('login')
    }
  }
  if (grecaptcha == '') {
    error.value = 'Captcha not set'
    return
  }
  form.grecaptcharesponse = grecaptcha
  try {
    const forgotten = await api.auth.forgotpwd(form)
    if (forgotten.err) {
      error.value = forgotten.err
      return
    }
    message.value = forgotten.msg
    requested.value = true
  }
  catch (err: any) {
    console.log("FORGOTPWD FAIL", err)
    error.value = err.message
  }
}

onMounted(async () => {
  if (runtimeConfig.public.RECAPTCHA_BYPASS) {
    message.value = 'Recaptcha bypass'
  } else {
    executeRecaptcha.value = await useVueRecaptcha() // needs to be done before other await calls
  }

  await sitePagesStore.fetch()
  miscStore.set({ key: 'page-title', value: 'Forgot password' })
  if (authStore.loggedin) {
    navigateTo('/panel')
  }
})
</script>
