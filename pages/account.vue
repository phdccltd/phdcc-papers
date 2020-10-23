<template>
  <div>
    <Messages :error="error" :message="message" />
    <div v-html="content">
    </div>
    <b-form @submit="onSubmit" @submit.stop.prevent>
      <b-row no-gutters>
        <b-col cols="3" class="col-form-label">
          Username:
        </b-col>
        <b-col cols="9" class="col-form-label">
          {{$auth.user.username}}
        </b-col>
      </b-row>
      <b-form-group label="Name:" label-for="name" label-cols-sm="3">
        <b-form-input id="name"
                      v-model="form.name"
                      autocomplete="name"
                      placeholder="Enter name"></b-form-input>
      </b-form-group>
      <b-form-group label="New password:" label-for="password" label-cols-sm="3">
        <b-form-input id="password"
                      v-model="form.password"
                      type="password"
                      autocomplete="new-password"
                      placeholder="Optionally enter a new password"></b-form-input>
      </b-form-group>
      <b-row no-gutters>
        <b-col cols="9" offset-md="3">
          <b-button type="submit" variant="primary">Save</b-button>
        </b-col>
      </b-row>
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
      this.$store.dispatch('sitepages/fetch')
      page.title = 'Account'
      if (!this.$auth.loggedIn) {
        this.$router.push('/login')
        return
      }
      this.$store.commit("page/setTitle", page.title)
    },

    computed: {
      content() {
        const sitepage = this.$store.getters['sitepages/get']('/account')
        if (sitepage) {
          return sitepage.content
        }
        return ''
      },
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
    },
    head() {
      return {
        title: page.title,
      }
    },
  }
</script>

<style>
</style>
