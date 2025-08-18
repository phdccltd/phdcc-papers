<template>
  <div>
    <Messages :error="error" :message="message" />
    <div v-html="content">
    </div>
    <UserAuthForm buttonText="Login" :submitForm="loginUser" v-bind:isRegister="false" />
    <div v-if="showtestdiv" id="recaptchaok"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'
import { useSitePagesStore } from "~/stores/sitepages"
//import {jwt_decode} from 'jwt-decode'
import api from '~/api'

const authStore = useAuthStore()
const miscStore = useMiscStore()
const sitePagesStore = useSitePagesStore()
const runtimeConfig = useRuntimeConfig()

const error = ref('')
const message = ref('')
const executeRecaptcha = ref(null)

const content = computed(() => {
  const sitepage = sitePagesStore.get('/login')
  return sitepage ? sitepage.content : ''
})

const showtestdiv = computed(() => {
  return runtimeConfig.public.RECAPTCHA_BYPASS && (executeRecaptcha.value != null)
})

const loginUser = async (loginInfo: any) => {
  error.value = ''
  message.value = ''
  let grecaptcha = ''
  if (runtimeConfig.public.RECAPTCHA_BYPASS && loginInfo.password !== 'userecapture') {
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
  loginInfo.grecaptcharesponse = grecaptcha

  const res = await api.auth.login(loginInfo)
  if (res.ret !== 0) {
    error.value = res.status
    return
  }
  //const ppuser = jwt_decode(res.token)
  //console.log("===PPUSER",ppuser)
  authStore.setToken(res.token)

  const user = await api.auth.getuser()
  authStore.setUser(user.user)

  navigateTo('/panel')
}

onMounted(async () => {
  //if (runtimeConfig.public.RECAPTCHA_BYPASS) {
  //  message.value = 'Recaptcha bypass'
  //} else {
  executeRecaptcha.value = await useVueRecaptcha() // needs to be done before other await calls
  //}

  await sitePagesStore.fetch()
  if (authStore.loggedin) {
    navigateTo('/panel')
  }
  miscStore.set({ key: 'page-title', value: 'Login' })
})
</script>
