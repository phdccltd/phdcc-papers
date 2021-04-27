<template>
  <!-- SUPER-ADMIN PAGE -->
  <div>
    <HelpSuper />
    <Messages :error="error" :message="message" />
    <div class="mt-2">
      <b-btn variant="outline-success" to="/admin/site-pages" class="ml-2">Site pages</b-btn>
    </div>
    <div class="mt-2">
    </div>

    <b-list-group>
      <b-list-group-item class="flow">
        <h2 class="bg-yellow pl-2 pt-2">
          Publications
          <b-btn @click="addpub()" variant="outline-success" class="mr-2 float-right">Add publication</b-btn>
        </h2>
        <b-container class="p-0">
          <b-row v-for="(pub, index) in pubs" :key="index"
                 style="border-bottom:1px solid rgba(0, 0, 0, 0.125);"
                 no-gutters :class="'p-2 '+(pub.owner?'pub-owner':(pub.notowner?'pub-notowner':($auth.user.super?'pub-super':'pub-weird')))">
            <b-col sm="3">
              <b-btn variant="outline-primary" :to="'/panel/'+pub.id">
                {{ pub.name }}
              </b-btn>
            </b-col>
            <b-col sm="2">
              <strong v-if="!pub.enabled">DISABLED</strong>
            </b-col>
            <b-col sm="7">
              {{ pub.description }}
            </b-col>
          </b-row>
        </b-container>
      </b-list-group-item>
    </b-list-group>




    <b-modal id="bv-modal-add-pub" size="lg" centered @ok="okAddPub" title="Add publication">
      <form ref="form" @submit.stop.prevent>
        <b-form-group label="Name"
                      label-for="pubname"
                      label-cols-sm="2">
          <b-form-input id="pubname" v-model="pubname" placeholder="Required" required></b-form-input>
        </b-form-group>
        <b-form-group label="Description"
                      label-for="pubdescr"
                      label-cols-sm="2">
          <b-form-textarea id="pubdescr"
                           v-model="pubdescr"
                           rows="3"
                           max-rows="10"
                           style="overflow-y: auto;"
                           placeholder="Required"
                           required>
          </b-form-textarea>
        </b-form-group>
      </form>
    </b-modal>
  </div>
</template>

<script>
  import { page } from '@/utils/page'
  import Messages from '~/components/Messages'
  import HelpSuper from '~/components/HelpSuper'

  const pagetitle = 'Site admin'
  page.title = pagetitle

  export default {
    middleware: 'authsuper',
    components: { Messages, HelpSuper },

    data({ app, params, store }) {
      return {
        error: '',
        message: '',
        pubname: '',
        pubdescr: ''
      }
    },

    mounted() {
      this.error = ''
      this.message = ''
      this.$store.dispatch('pubs/clearError')
      this.$store.dispatch('pubs/fetch')
      this.$store.commit("page/setTitle", pagetitle)
      document.title = pagetitle
      page.title = pagetitle
    },

    computed: {
      pubs() {
        const pubs = this.$store.getters['pubs/get']
        return pubs
      }
    },

    methods: {
      /* ************************ */
      addpub() {
        this.pubname = ''
        this.pubdescr = ''
        this.$bvModal.show('bv-modal-add-pub')
      },
      /* ************************ */
      async okAddPub(bvModalEvt) {
        //console.log('okAddPub', this.pubname, this.pubdescr)
        bvModalEvt.preventDefault()
        try {
          this.pubname = this.pubname.trim()
          this.pubdescr = this.pubdescr.trim()
          if (this.pubname.length === 0) return await this.$bvModal.msgBoxOk('Please give a publication name')
          if (this.pubdescr.length === 0) return await this.$bvModal.msgBoxOk('Please give a publication description')

          const ok = await this.$api.pub.addPub(this.pubname, this.pubdescr)

          if (ok) {
            this.$store.dispatch('pubs/fetch')
            this.$nextTick(() => {
              this.$bvModal.hide('bv-modal-add-pub')
              this.$bvModal.msgBoxOk('Publication added')
            })
          } else {
            await this.$bvModal.msgBoxOk('Add went wrong', { title: 'FAIL', headerBgVariant: 'warning' })
          }
        } catch (e) {
          await this.$bvModal.msgBoxOk('Error adding publication: ' + e.message)
        }
      }
    },

    head() {
      return {
        title: pagetitle
      }
    }
  }
</script>

