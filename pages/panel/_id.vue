<template>
  <div>
    <b-alert variant="danger" :show="error!=false">
      {{error}}
    </b-alert>
    <b-alert variant="success" :show="message!=false">
      {{message}}
    </b-alert>
    <b-list-group class="flows">
      <b-list-group-item v-for="(flow, index) in flows" :key="index" class="flow">
        <h2>
          {{ flow.name }}
          <b-btn v-if="flow.addtype" variant="outline-success" :to="'/panel/'+pub.id+'/'+flow.id+'/add'">Add {{flow.addtype}}</b-btn>
        </h2>
        <b-list-group class="flows">
          <b-list-group-item v-for="(submit, index) in flow.submits" :key="index" class="submit">
            <nuxt-link :to="{ name: 'id', params: { id: index } }">
              {{ submit.name }}
            </nuxt-link>
          </b-list-group-item>
        </b-list-group>
      </b-list-group-item>
    </b-list-group>
    <div v-if="nowtavailable" class="mt-2">
      <strong>Nothing submitted yet</strong>
    </div>
  </div>
</template>

<script>
  const _ = require('lodash/core')
  import { page } from '@/utils/phdcc'

  page.title = ''

  export default {
    middleware: 'authuser',
  components: {
  },
  data({ app, params, store }) {
    //console.log('_id data')
    return {
      pub: {},
      error: false,
      message: false,
      flows: [],
      nowtavailable: false,
    }
  },
  computed: {
    // user() {
    //  console.log('USER', this.$route.params.id)
    //  return this.$store.state.users.list[this.$route.params.id]
    // },
  },
  validate({ params, query, store }) {
    // It will be called server-side once (on the first request to the Nuxt app) and client-side when navigating to further routes.
    console.log('_id validate', params.id)
    // if (params && 'id' in params) return !isNaN(params.id)
    return /^\d+$/.test(params.id) // Must be a number
    // return true // if the params are valid
    // throw new Error('Under Construction!')
    // return false // will stop Nuxt.js to render the route and display the error page
  },
  async mounted() {
    console.log('_id mounted', this.$route.params.id)
    try {
      const { pub } = await this.$api.pub.fetch({ id: this.$route.params.id })
      if (!pub) throw new Error('pub not returned')
      //console.log('_id mounted pub', pub)
      page.title = pub.name
      this.$store.commit("page/setTitle", page.title)
      this.pub = pub
      const { flows } = await this.$api.submit.fetch({ pubid: pub.id })
      //console.log('_id mounted submits', flows)
      this.flows = flows
      let countsubmits = 0
      for (const flow of flows) {
        for (const accepting of flow.acceptings) {
          if (_.isNull(accepting.flowstatusId) && accepting.open) {
            const addstage = _.find(flow.stages, stage => { return stage.id === accepting.flowstageId })
            if (addstage) {
              flow.addtype = addstage.name
            }
          }
        }
        countsubmits += flow.submits.length
      }
      this.nowtavailable = countsubmits === 0
    } catch (e) {
      this.error = e.message
    }
  },
  head() {
    return {
      title: page.title,
    }
  },
}
</script>
