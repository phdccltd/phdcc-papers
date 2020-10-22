<template>
  <div>
    <Messages :error="error" :message="message" />
    <div v-html="content">
    </div>
    <b-form @submit="onSubmit" @submit.stop.prevent>
      <b-form-group label="Email address:" label-cols-sm="3"
                    label-for="email">
        <b-form-input id="email"
                      v-model="form.email"
                      type="email"
                      required
                      placeholder="Enter email"></b-form-input>
      </b-form-group>
      <b-row no-gutters>
        <b-col cols="9" offset-md="3">
          <b-button :disabled="requested" type="submit" variant="primary">
            Email login link
            <v-icon v-if="requested" name="check-circle" scale="1" class="ml-1" />
          </b-button>
        </b-col>
      </b-row>
    </b-form>
  </div>
</template>

<script>
  // http://sahatyalkabov.com/how-to-implement-password-reset-in-nodejs/
  import Messages from '~/components/Messages'
  import { page } from '@/utils/phdcc'

  page.title = 'Forgot password'

  export default {
    components: { Messages },

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
      this.$store.dispatch('sitepages/fetch')
      page.title = 'Forgot password'
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
        const sitepage = this.$store.getters['sitepages/get']('/forgotpwd')
        if (sitepage) {
          return sitepage.content
        }
        return ''
      },
    },
    methods: {
      async onSubmit(evt) {
        console.log('this.form',this.form)
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
        }
        this.form['g-recaptcha-response'] = token
        try {
          let forgotten = await this.$api.user.forgotpwd(this.form)
          console.log("forgotten", forgotten)
          if (forgotten.err) {
            this.error = forgotten.err
            return
          }
          this.message = forgotten.msg
          this.requested = true
        }
        catch (err) {
          console.log("FORGOTPWD FAIL", err)
          this.error = err.message
        }
      }

    }
  }
</script>

<style>
</style>
