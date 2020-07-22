<template>
  <div>
    <Messages :error="error" :message="message" />
    <b-form @submit="onSubmit" @submit.stop.prevent>
      <b-form-group label="Name:" label-for="name">
        <b-form-input id="name"
                      v-model="form.name"
                      autocomplete="name"
                      placeholder="Enter name"></b-form-input>
      </b-form-group>
      <b-form-group label="New password:" label-for="password">
        <b-form-input id="password"
                      v-model="form.password"
                      type="password"
                      autocomplete="new-password"
                      placeholder="Optionally enter password"></b-form-input>
      </b-form-group>
      <b-button type="submit" variant="primary">Save</b-button>
    </b-form>
  </div>
</template>

<script>
  import Messages from '~/components/Messages'
  import { page } from '@/utils/phdcc'

  page.title = 'Account'

  export default {
    components: { Messages },

    data() {
      return {
        form: {
          name: this.$auth.user.name,
          password: '',
        },
        error: '',
        message: '',
      }
    },
    async mounted() {
      //console.log('account MOUNTED')
      if (!this.$auth.loggedIn) {
        this.$router.push('/login')
        return
      }
      this.$store.commit("page/setTitle", page.title)
    },

    head() {
      return {
        title: page.title,
      }
    },
    methods: {
      async onSubmit(evt) {
        this.error = ''
        this.message = ''
        //console.log('this.form', this.form)
        const changedName = this.form.name !== this.$auth.user.name
        const changedPassword = this.form.password
        if (!changedName && !changedPassword) {
          this.error = 'No changes'
          return
        }
        try {
          const response = await this.$api.user.save(this.form)
          //console.log(response)
          if (response.ret !== 0) {
            this.error = response.status
          } else {
            if (changedName) this.$auth.user.name = this.form.name
            this.message = 'Changes saved'
          }
        }
        catch (err) {
          console.log("ACCOUNT FAIL", err.message)
          this.error = err.message
        }
      }
    }
  }
</script>

<style>
</style>
