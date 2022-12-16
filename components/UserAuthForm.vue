<template>
  <b-form @submit="onSubmit" @submit.stop.prevent>
    <b-form-group label="Username:" label-for="username" label-cols-sm="3">
      <b-form-input id="username" v-model="form.username" autocomplete="username" required placeholder="Enter username"></b-form-input>
    </b-form-group>

    <b-form-group label="Email address:" label-cols-sm="3" label-for="email" description="We'll never share your email with anyone else."
      v-if="isRegister">
      <b-form-input id="email" v-model="form.email" type="email" required placeholder="Enter email"></b-form-input>
    </b-form-group>

    <b-form-group label="Password:" label-for="password" label-cols-sm="3">
      <b-form-input id="password" v-model="form.password" type="password" autocomplete="current-password" required
        placeholder="Enter password"></b-form-input>
    </b-form-group>

    <b-form-group v-if="isRegister" label-cols-sm="3">
      <b-form-checkbox v-model="form.agreed" id="agreed" name="agreed" required>
        I agree to the <a href="/terms" target="_blank">terms of use</a>
      </b-form-checkbox>
    </b-form-group>
    <b-row no-gutters>
      <b-col cols="9" offset-md="3">
        <nuxt-link to="/forgotpwd" class="float-end">Forgotten password?</nuxt-link>
        <b-button type="submit" variant="primary">{{ buttonText }}</b-button>
      </b-col>
    </b-row>
  </b-form>
</template>

<script lang="ts">
export default {
  data() {
    return {
      form: {
        username: '',
        email: '',
        password: '',
        agreed: false
      },
    }
  },
  props: {
    submitForm: {
      type: Function,
      required: true,
    },
    buttonText: {
      type: String,
      required: true,
    },
    isRegister: Boolean,
  },
  methods: {
    onSubmit(_evt: any) {
      this.submitForm(this.form)
    }
  },
}
</script>
