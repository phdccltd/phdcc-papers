<template>
  <div>
    <Messages :error="error" :message="message" />
    <div v-html="content">
    </div>
    <UserAuthForm buttonText="Login" :submitForm="loginUser" v-bind:isRegister="false" />
  </div>
</template>

<script>
  import UserAuthForm from '~/components/UserAuthForm.vue'
  import Messages from '~/components/Messages'
  import { page } from '@/utils/page'

  page.title = 'Login'

  export default {
    components: { Messages, UserAuthForm },

    data() {
      return {
        error: '',
        message: '',
      }
    },
    async mounted() {
      this.$store.dispatch('sitepages/fetch')
      page.title = 'Login'
      if (this.$auth.loggedIn) {
        this.$router.push('/panel')
        return
      }
      this.$store.commit("page/setTitle", page.title)
      if (process.env.RECAPTCHA_BYPASS) {
        this.message = 'Recaptcha bypass'
      } else {
        await this.$recaptcha.init()
      }
    },

    head() {
      return {
        title: page.title,
      }
    },
    computed: {
      content() {
        const sitepage = this.$store.getters['sitepages/get']('/login')
        if (sitepage) {
          return sitepage.content
        }
        return ''
      },
    },
    methods: {
      async loginUser(loginInfo) {
        //console.log(loginInfo)
        this.error = ''
        this.message = ''
        let token = false
        if (process.env.RECAPTCHA_BYPASS) {
          token = process.env.RECAPTCHA_BYPASS
        } else {
          try {
            token = await this.$recaptcha.execute('login')
          } catch (e) {
            this.error = 'Captcha not set'
            return
          }
          //console.log('$recaptcha', token)
        }
        loginInfo['g-recaptcha-response'] = token
        try {
          const response = await this.$auth.loginWith('local', {
            data: loginInfo
          })
          //console.log("response", response)
          if (response.data.ret !== 0) {
            console.log("SET ERROR", response.data.status)
            this.error = response.data.status
            return
          }
          if (this.$auth.user) {
            this.message = "Hello " + this.$auth.user.name
            //console.log("GO TO PANEL")
            this.$router.push('/panel')
          } else {
            console.log("NOT LOGGED IN AFTER ALL")
            this.error = 'Hmmm - not logged in'
          }
        }
        catch (err) {
          console.log("LOGIN FAIL", err)
          this.error = err.message
        }
      }
    }
  }
</script>
