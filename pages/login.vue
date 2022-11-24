<template>
  <div>
    <Messages :error="error" :message="message" />
    <div v-html="content">
    </div>
    <p>Token: {{ token }}</p>
    <UserAuthForm buttonText="Login" :submitForm="loginUser" v-bind:isRegister="false" />
  </div>
</template>

<script lang="ts">
  import { useSitePagesStore } from "~/stores/sitepages";
  //import { useAuthStore } from '~/stores/auth'
  import Messages from '~/components/Messages.vue'
  import UserAuthForm from '~/components/UserAuthForm.vue'
  //import { page } from '@/utils/page'
  import axios from 'axios'
  import jwt_decode from 'jwt-decode'
import { dataToEsm } from "@rollup/pluginutils";

  //page.title = 'Login'

  export default {
    components: { Messages, UserAuthForm },

    setup(){
      const sitePagesStore = useSitePagesStore()
      //const authStore = useAuthStore()
      const runtimeConfig = useRuntimeConfig()
      const token = ref(runtimeConfig.public.RECAPTCHA_BYPASS);

      return { sitePagesStore, token }
    },
    
    data() {
      return {
        error: '',
        message: '',
      }
    },

    async mounted() {
      /*this.$store.dispatch('sitepages/fetch')
      page.title = 'Login'
      if (this.$auth.loggedIn) {
        this.$router.push('/panel')
        return
      }*/
      //this.$store.commit("page/setTitle", page.title)
      const runtimeConfig = useRuntimeConfig()
      if( runtimeConfig.public.RECAPTCHA_BYPASS){
        this.message = 'Recaptcha bypass'
      } else {
        this.token = await useVueRecaptcha();
      }
    },

    computed: {
      content() {
        return this.sitePagesStore.get('/login')
      },
    },
    methods: {
      async loginUser(loginInfo: any) {
        console.log("loginUser")
        console.log("===", loginInfo)
        this.error = ''
        this.message = ''
        if( this.token==''){
          this.error = 'Captcha not set'
          return
        }
        loginInfo['g-recaptcha-response'] = this.token

        const runtimeConfig = useRuntimeConfig()
        const api = runtimeConfig.public.API
        console.log("===API",api)
        const res = await axios.post(api + '/user/login',loginInfo) // login: { url: process.env.API + '/user/login', method: 'post', propertyName: 'token' },
        console.log("---",res)
        if( res.data.ret!==0){
          this.error = res.data.status
          return
        }
        const ppuser = jwt_decode(res.data.token)
        console.log("===PPUSER",ppuser)
        
        const user = await axios.get(api + '/user',{
          headers: {'Authorization': 'bearer '+res.data.token
        }
        }) // user: { url: process.env.API + '/user', method: 'get', propertyName: 'user' },
        console.log("===USER",user)


        /*this.authStore
          .login({
            email: this.email,
            password: this.password,
          })
          .then(() => {}*/
        /*try {
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
        }*/
      }
    }
  }
</script>
