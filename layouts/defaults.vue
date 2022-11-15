<template>
  <div>
    <div class='container'>
      <div class="border border-primary rounded p-3">
        <div class="float-right">
          <div>
            <b-button variant="outline-success" to="/login">Login</b-button>
            <b-button variant="outline-secondary" to="/register">Register</b-button>
          </div>
        </div>
        <b-button variant="outline-secondary" class="mr-2" to="/" title="Home">
          <v-icon name="home" scale="1" />
        </b-button>
        <b-button variant="outline-secondary" class="mr-2" to="/panel" title="Control Panel">
          <v-icon name="home" scale="1" />
        </b-button>
        <h1 class="menu-title">
          {{ title }}
          {{ titlesuffix }}
        </h1>
      </div>
    </div>
    <slot />
    <div class="container mt-3 pt-2 border-top" style="color:gray">
      <a href="https://www.phdcc.com/papers/">Papers {{ version }}/{{apiversion}}</a>,
      <span style="color:lightgrey">
        built: {{BUILD_DATE}}.
        Copyright &copy; 2022 PHD Computer Consultants Ltd.
      </span><br />
      <a href="https://www.phdcc.com/feedback.html" target="_blank" rel="noopener">Get in touch if you want to try out Papers for your conference or journal.</a>
    </div>
  </div>
</template>
  
<script>

//console.log("DEFAULTS.VUE")
export default {
computed: { // Client and Server
      yourtime() {
        //console.log('====== layout computed yourtime')
        const now = new Date()
        return now.toLocaleString()
      },
      version() {
        return process.env.VERSION
      },
      BUILD_DATE() {
        return process.env.BUILD_DATE
      },
      apiversion() {
        //console.log('GET APIVERSION')
        return "API1x"
        //return this.$store.getters['misc/get']('apiversion')
      },
      title() {
        return "Page title"
      },
      titlesuffix() {
        return "suffix"
        //return this.$store.getters['page/titlesuffix'] // as changes reactively as we move about
      }}
}

</script>