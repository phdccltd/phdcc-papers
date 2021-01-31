<template>
  <div>
    <Messages :error="error" :message="message" />
    <div v-html="content">
    </div>
    <UserAuthForm buttonText="Register" :submitForm="registerUser" v-bind:isRegister="true" />
  </div>
</template>

<script>
  import UserAuthForm from '~/components/UserAuthForm.vue'
  import Messages from '~/components/Messages'
  import { page } from '@/utils/phdcc'

  page.title = 'Register'

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
      page.title = 'Register'
      //console.log('register MOUNTED')
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
        const sitepage = this.$store.getters['sitepages/get']('/register')
        if (sitepage) {
          return sitepage.content
        }
        return ''
      },
    },
    methods: {
      async registerUser(registrationInfo) {
        //console.log(registrationInfo)
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
        registrationInfo['g-recaptcha-response'] = token
        try {
          let response = await this.$api.user.register(registrationInfo)
          //console.log(response)
          if (response.ret !== 0) {
            this.error = response.status
            return
          }
          // Pass token to loginWith to stop duplicate recatcha validate
          registrationInfo.token = response.user.token
          response = await this.$auth.loginWith('local', {
            data: registrationInfo
          })
          //console.log(response)
          if (response.data.ret !== 0) {
            console.log("SET ERROR", response.data.status)
            this.error = response.data.status
            return
          }
          if (this.$auth.user) {
            this.message = "Hello " + this.$auth.user.name
            this.$router.push('/panel')
          } else {
            console.log("NOT LOGGED IN AFTER ALL")
            this.error = 'Hmmm - not logged in'
          }
        }
        catch (err) {
          console.log("REGISTER FAIL", err.message)
          this.error = err.message
        }
      }
    }
  }
</script>
