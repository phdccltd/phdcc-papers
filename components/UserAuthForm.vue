<template>
  <b-form @submit="onSubmit" :xvalidated="true" @submit.stop.prevent>
    <b-form-group label="Username:" label-for="username">
      <b-form-input id="username"
                    v-model="form.username"
                    autocomplete="username"
                    required
                    placeholder="Enter username"></b-form-input>
    </b-form-group>

    <b-form-group label="Email address:"
                  label-for="email"
                  description="We'll never share your email with anyone else."
                  v-if="isRegister">
      <b-form-input id="email"
                    v-model="form.email"
                    type="email"
                    required
                    placeholder="Enter email"></b-form-input>
    </b-form-group>

    <b-form-group label="Password:" label-for="password">
      <b-form-input id="password"
                    v-model="form.password"
                    type="password"
                    autocomplete="current-password"
                    required
                    placeholder="Enter password"></b-form-input>
    </b-form-group>

    <b-form-group v-if="isRegister">
      <b-form-checkbox v-model="form.agreed" :state="validAgreed" id="agreed" name="agreed" required>
        I agree to the terms of use
      </b-form-checkbox>
      <b-form-invalid-feedback :state="validAgreed">
        You must agree to the terms
      </b-form-invalid-feedback>
    </b-form-group>
    <b-button type="submit" variant="primary">{{ buttonText }}</b-button>
  </b-form>
</template>

<script>
  //import validations from "@/utils/validations";
  //import UserAuthPassword from '@/components/UserAuthPassword.vue';

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
    components: {
      //UserAuthPassword
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
      isRegister: Boolean
    },
    computed: {
      validAgreed() { // NOT CALLED
        console.log('validAgreed')
        console.log('validAgreed', this.checked)
        return this.checked
      }
    },
    methods: {
      onSubmit(evt) {
        //console.log('this.form',this.form)
        this.submitForm(this.form)
      }
      
    }
  }
</script>

<style lang="scss" scoped>
</style>
