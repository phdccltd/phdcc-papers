<template>
  <div>
    <Messages :error="error" :message="message" />
    <div v-html="content">
    </div>
    <b-form @submit="onSubmit" @submit.stop.prevent>
      <b-row no-gutters>
        <b-col sm="3" class="col-form-label">
          Username:
        </b-col>
        <b-col sm="9" class="col-form-label">
          {{form.username}}
        </b-col>
      </b-row>
      <b-form-group label="Password:" label-for="password" label-cols-sm="3">
        <b-form-input id="password"
                      v-model="form.password"
                      type="password"
                      autocomplete="current-password"
                      required
                      placeholder="Enter password"></b-form-input>
      </b-form-group>
      <b-row no-gutters>
        <b-col cols="9" offset-md="3">
          <b-button type="submit" variant="primary">
            Change password
          </b-button>
        </b-col>
      </b-row>
    </b-form>
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
        message: '',
        form: {
          username: 'brian',
          password: '',
        },
      }
    },
    async mounted() {
      this.$store.dispatch('sitepages/fetch')
      page.title = 'Reset password'
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
        const sitepage = this.$store.getters['sitepages/get']('/resetpwd')
        if (sitepage) {
          return sitepage.content
        }
        return ''
      },
    },
    methods: {
      async onSubmit(evt) {
      },
    }
  }
</script>

<style>
</style>
