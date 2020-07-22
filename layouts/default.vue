<template>
  <div>
    <div class="container">
      <div class="border border-primary rounded p-3">
        <div class="float-right">
          <div v-if="$auth.loggedIn">
            <b-btn to="/account" variant="outline-secondary" class="mr-2">{{ $auth.user.name }}</b-btn>
            <b-btn @click="logout()" variant="outline-secondary" class="mr-2">Logout</b-btn>
          </div>
          <div v-else>
            <b-btn variant="outline-success" to="/login">Login</b-btn>
            <b-btn variant="outline-secondary" to="/register">Register</b-btn>
          </div>
        </div>
        <b-btn variant="outline-secondary" class="mr-2" to="/" v-if="!$auth.user">Home</b-btn>
        <b-btn variant="outline-secondary" class="mr-2" to="/panel" v-if="$auth.user">Panel</b-btn>
        <b-btn to="/admin" variant="outline-primary" class="mr-2" v-if="$auth.user && $auth.user.super">Users</b-btn>
        <h1 class="menu-title">{{ title }}</h1>
      </div>
    </div>
    <nuxt class="container" />
    <div class="container mt-3">
      <hr />
      Your time: {{ yourtime }} - Copyright &copy; 2020 PHD Computer Consultants Ltd, <a href="https://www.phdcc.com/papers/">PHDCC</a>
    </div>
  </div>
</template>

<script>
  import { page } from '@/utils/phdcc'
  export default {
    // Note: asyncData NOT CALLED IN LAYOUT
    data() { // Client and Server
      return {
        pagemounted: false
      }
    },
    mounted() { // Only client
      this.pagemounted = true
    },
    computed: { // Client and Server
      yourtime() {
        //console.log('====== layout computed yourtime')
        const now = new Date()
        return now.toLocaleString()
      },
      title() {
        if (this.pagemounted) {
          return this.$store.getters['page/title'] // as changes reactively as we move about
        } else {
          return page.title
        }
      }
    },
    methods: {
      logout() {
        console.log('logout')
        this.$auth.logout()
        //window.localStorage.removeItem('papers')
        this.$store.dispatch('misc/clear')
        this.$router.push('/')
      }
    }
  }

</script>

<style>
  /*
html {
  font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}

*,
*:before,
*:after {
  box-sizing: border-box;
  margin: 0;
}

.button--green {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #3b8070;
  color: #3b8070;
  text-decoration: none;
  padding: 10px 30px;
}

.button--green:hover {
  color: #fff;
  background-color: #3b8070;
}

.button--grey {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #35495e;
  color: #35495e;
  text-decoration: none;
  padding: 10px 30px;
  margin-left: 15px;
}

.button--grey:hover {
  color: #fff;
  background-color: #35495e;
}
*/
  .menu-title {
    font-size: 1.5rem;
    font-weight: bold;
    display: inline;
  }


</style>
