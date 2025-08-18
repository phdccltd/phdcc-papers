<template>
  <div>
    <Messages :error="error" :message="message" />
    <div v-html="content" data-cy="resetpwd-content">
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'
import { useSitePagesStore } from "~/stores/sitepages"
import api from '~/api'

const authStore = useAuthStore()
const miscStore = useMiscStore()
const sitePagesStore = useSitePagesStore()
const runtimeConfig = useRuntimeConfig()

const error = ref('')
const message = ref('Please wait, logging you in...')

const content = computed(() => {
  const sitepage = sitePagesStore.get('/resetpwd')
  return sitepage ? sitepage.content : ''
})

onMounted(async () => {
  let executeRecaptcha = null
  if (runtimeConfig.public.RECAPTCHA_BYPASS) {
    message.value = 'Recaptcha bypass'
  } else {
    executeRecaptcha = await useVueRecaptcha() // needs to be done before other await calls
  }

  await sitePagesStore.fetch()
  if (authStore.loggedin) {
    navigateTo('/panel')
  }
  miscStore.set({ key: 'page-title', value: 'Reset password' })

  let token: string | boolean = false
  if (window.location.search) {
    if (window.location.search.substring(0, 1) === '?') {
      token = window.location.search.substring(1)
    }
  }
  if (!token) {
    error.value = 'Invalid reset password request'
    message.value = ''
    return
  }

  const resetpwdinfo = {
    reset: token,
  }
  try {
    let grecaptcha = ''
    if (runtimeConfig.public.RECAPTCHA_BYPASS) {
      grecaptcha = runtimeConfig.public.RECAPTCHA_BYPASS
    } else {
      if (executeRecaptcha) {
        grecaptcha = await executeRecaptcha('login')
      }
    }
    resetpwdinfo.grecaptcharesponse = grecaptcha
    const res = await api.auth.login(resetpwdinfo)
    if (res.ret === 0) {
      authStore.setToken(res.token)
      const user = await api.auth.getuser()

      authStore.setUser(user.user)
      navigateTo('/account')
    } else {
      error.value = res.status
      message.value = ''
    }
  }
  catch (err: any) {
    console.log("RESET FAIL", err.message)
    error.value = err.message
    message.value = ''
  }
})
</script>
