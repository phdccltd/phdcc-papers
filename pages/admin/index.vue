<template>
  <!-- ADMIN PAGE -->
  <div class="container">
    <div>
      <h1 class="title">
        phdcc-papers
      </h1>
      <h2 class="subtitle">
        Conference abstract and paper submission and review system
      </h2>
      <ul class="users">
        <li v-for="(user, index) in users" :key="index" class="user">
          <nuxt-link :to="{ name: 'id', params: { id: index } }">
            {{ user.name }}
          </nuxt-link>
        </li>
      </ul>
      <form>
        <p>Username</p>
        <b-form-input id="username" maxlength="140" placeholder="Username" class="mb-1" />
        <p>Password</p>
        <b-form-input id="password" type="password" maxlength="140" placeholder="Password" class="mb-1" />
        <p>{{ message }}</p>
        <button v-on:click="reverseMessage">Reverse Message</button>
      </form>
      <button v-on:click="reverseMessage2">Reverse Message2</button>
    </div>
  </div>
</template>

<script>

  export default {
    middleware: auth-admin,
  components: {
  },

  fetch() {
    console.log('index fetch...')
    // DEPRECATED The `fetch` method is used to fill the store before rendering the page
  },

  async asyncData({ req, res }) { // this (component) not available
    console.log('index asyncData')
    // Please check if you are on the server side before using req and res
    if (process.server) {
      return { host: req.headers.host }
    }
    return {}
  },

  data({ app, params, store }) {
    console.log('index data')
    return {
      message: 'Hello Vue.js!',
      users: [],
    }
  },
  computed: {
    persons() {
      console.log('index computed persons')
      return []
    },
    /* users() {
        console.log('USERS')
        return this.$store.state.users.list
      }, */
  },
  async mounted() {
    console.log('index MOUNTED')
    const { users } = await this.$api.users.fetch()
    //const users = [{ name: 'Alexandre' }, { name: 'Pooya' }, { name: 'Sébastien' }]
    console.log(users)
    this.users = users
  },

  head() {
    return {
      title: 'Users',
    }
  },
  methods: {
    reverseMessage: function () {
      this.message = this.message.split('').reverse().join('')
      return false
    },
    reverseMessage2: function () {
      this.message = this.message.split('').reverse().join('')
    }
  }
}
</script>

<style>
.xcontainer {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>
