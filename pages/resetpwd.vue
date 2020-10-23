<template>
  <div>
    <Messages :error="error" :message="message" />
    <div v-html="content">
    </div>
  </div>
</template>

<script>
  import Messages from '~/components/Messages'
  import { page } from '@/utils/phdcc'

  page.title = 'Reset password'

  export default {
    components: { Messages },

    data() {
      return {
        error: '',
        message: 'Please wait, logging you in...',
      }
    },
    async mounted() {

      console.log('resetpwd', window.location.search)
      let token = false
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
      console.log('resetpwd token', token)
      this.$store.dispatch('sitepages/fetch')
      page.title = 'Reset password'
      if (this.$auth.loggedIn) {
        this.$router.push('/panel')
        return
      }
      this.$store.commit("page/setTitle", page.title)
      let recaptcha = false
      if (process.env.RECAPTCHA_BYPASS) {
        this.message += '. Recaptcha bypass'
        recaptcha = process.env.RECAPTCHA_BYPASS
      } else {
        try {
          await this.$recaptcha.init()
          console.log('RECAPTCHA INITED')
          recaptcha = await this.$recaptcha.execute('login')
          console.log('RECAPTCHA EXECUTED')
        } catch (e) {
          this.error = 'Captcha not set'
          this.message = ''
          return
        }
      }
      const resetpwdinfo = {
        reset: token,
      }
      resetpwdinfo['g-recaptcha-response'] = recaptcha
      const response = await this.$auth.loginWith('local', {
        data: resetpwdinfo
      })
      if (response.data.ret === 0) {
        this.$router.push('/account')
      } else {
        this.error = response.data.status
        this.message = ''
      }
    },

    head() {
      return {
        title: page.title,
      }
    },
    computed: {
      content() {
        const sitepage = this.$store.getters['sitepages/get']('/resetpwd')
        if (sitepage) {
          return sitepage.content
        }
        return ''
      },
    },
  }
</script>

<style>
</style>
