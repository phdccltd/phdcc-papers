<template>
  <div>
    <!-- MOSTLY DONE -->
    <Messages :error="error" :message="message" />
    <div v-html="content">
    </div>
    <b-form @submit="onSubmit" @submit.stop.prevent>
      <b-row no-gutters>
        <b-col cols="3" class="col-form-label">
          Username:
        </b-col>
        <b-col cols="9" class="col-form-label">
          {{ username }}
        </b-col>
      </b-row>
      <b-form-group label="Name:" label-for="name" label-cols-sm="3">
        <b-form-input id="name" v-model="form.name" autocomplete="name" placeholder="Enter name"></b-form-input>
      </b-form-group>
      <b-form-group label="Email:" label-for="email" label-cols-sm="3">
        <b-form-input id="email" v-model="form.email" type="email" placeholder="Enter email"></b-form-input>
      </b-form-group>
      <b-form-group label="New password:" label-for="password" label-cols-sm="3">
        <b-form-input id="password" v-model="form.password" type="password" autocomplete="new-password" placeholder="Optionally enter a new password">
        </b-form-input>
      </b-form-group>
      <b-row no-gutters>
        <b-col cols="9" offset-md="3">
          <b-button type="submit" variant="primary">Save</b-button>
        </b-col>
      </b-row>
    </b-form>
  </div>
</template>

<script lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'
import { useSitePagesStore } from "~/stores/sitepages";
import Messages from '~/components/Messages.vue'
import { default as api2 } from '~/api'

export default {
  setup() {
    const authStore = useAuthStore()
    const miscStore = useMiscStore()
    const sitePagesStore = useSitePagesStore()

    const api = api2()

    return { api, authStore, miscStore, sitePagesStore }
  },
  data() {
    return {
      form: {
        name: this.authStore.name,
        email: this.authStore.email,
        password: '',
      },
      error: '',
      message: '',
    }
  },
  async mounted() {
    await this.sitePagesStore.fetch()
    if (!this.authStore.loggedin) {
      navigateTo('/login');
    }
    this.miscStore.set({ key: 'page-title', value: 'Account' })
  },

  computed: {
    content() {
      const sitepage = this.sitePagesStore.get('/account')
      return sitepage ? sitepage.content : '';
    },
    username() {
      return this.authStore.username
    }
  },
  methods: {
    async onSubmit() {
      this.error = ''
      this.message = ''
      this.form.name = this.form.name.trim()
      this.form.email = this.form.email.trim()
      if (this.form.name.length === 0) { this.error = 'No name given'; return }
      if (this.form.email.length === 0) { this.error = 'No email given'; return }
      const changedName = this.form.name !== this.authStore.name
      const changedEmail = this.form.email !== this.authStore.email
      const changedPassword = this.form.password
      if (!changedName && !changedEmail && !changedPassword) {
        this.error = 'No changes'
        return
      }
      try {
        const response = await this.api.auth.save(this.form)
        if (response.ret !== 0) {
          this.error = response.status
        } else {
          const user = await this.api.auth.getuser()
          this.authStore.setUser(user.user);
          this.message = 'Changes saved'
        }
      }
      catch (err: any) {
        console.log("ACCOUNT FAIL", err.message)
        this.error = err.message
      }
    }
  },
}
</script>
