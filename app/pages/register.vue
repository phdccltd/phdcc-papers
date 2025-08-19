<template>
  <div>
    <Messages :error="error" :message="message" />
    <div v-html="content">
    </div>
    <UserAuthForm buttonText="Register" :submitForm="registerUser" v-bind:isRegister="true" />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'
import { useSitePagesStore } from "~/stores/sitepages"
import api from '~/api'

const authStore = useAuthStore()
const miscStore = useMiscStore()
const sitePagesStore = useSitePagesStore()

const error = ref('')
const message = ref('')
const executeRecaptcha = ref(null)

const content = computed(() => {
  const sitepage = sitePagesStore.get('/register')
  return sitepage ? sitepage.content : ''
})

onMounted(async () => {
  const runtimeConfig = useRuntimeConfig()
  if (runtimeConfig.public.RECAPTCHA_BYPASS) {
    message.value = 'Recaptcha bypass'
  } else {
    executeRecaptcha.value = await useVueRecaptcha() // needs to be done before other await calls
  }

  await sitePagesStore.fetch()
  if (authStore.loggedin) {
    navigateTo('/panel')
  }
  miscStore.set({ key: 'page-title', value: 'Register' })
})

const registerUser = async (registrationInfo: any) => {
  error.value = ''
  message.value = ''
  const runtimeConfig = useRuntimeConfig()
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
  registrationInfo.grecaptcharesponse = grecaptcha
  try {
    let res = await api.auth.register(registrationInfo)
    if (res.ret !== 0) {
      error.value = res.status
      return
    }

    // Pass token to loginWith to stop duplicate recatcha validate
    registrationInfo.token = res.user.token
    res = await api.auth.login(registrationInfo)
    authStore.setToken(res.token)

    const user = await api.auth.getuser()
    authStore.setUser(user.user)

    navigateTo('/panel')
  }
  catch (err: any) {
    console.log("REGISTER FAIL", err.message)
    error.value = err.message
  }
}
</script>
