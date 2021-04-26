<template>
  <!-- ADMIN SITE PAGES -->
  <!-- Access check: correctly fails as API returns error if not allowed -->
  <div>
    <b-alert v-if="fatalerror" variant="warning" :show="true">
      ERROR {{fatalerror}}
    </b-alert>
    <HelpSuperSitePages />
    <Messages :error="error" :message="message" />
    <b-container class="bg-yellow p-3">
      <b-row no-gutters>
        <b-col sm="6">
          <b-btn variant="outline-success" @click="startAddSitePage()">
            Add site page
          </b-btn>
        </b-col>
        <b-col sm="6">
        </b-col>
      </b-row>
    </b-container>
    <b-list-group class="sitepages">
      <b-list-group-item v-for="(sitepage, index) in sitepages" :key="index" class="">
        <h3 class="sitepage-submit-h3">
          <b-link @click="deleteSitePage(sitepage)">
            <v-icon name="times-circle" scale="1" class="btn-outline-danger" />
          </b-link>
          <b-link @click="toggleSitePageShow(sitepage)">
            {{sitepage.id}}: {{sitepage.path}} - {{sitepage.title}}
          </b-link>
          <NuxtLink target="_blank" :to="sitepage.path" class="float-right">
            <v-icon name="external-link-alt" scale="1.5" class="btn-outline-warning" />
          </NuxtLink>
          <b-btn variant="link" @click="startEditSitePage(sitepage)">
            <v-icon name="edit" scale="1.5" class="btn-outline-warning" />
          </b-btn>
        </h3>
        <b-container v-if="sitepage.visible">
          <b-row no-gutters>
            <b-col sm="2">
              Path
            </b-col>
            <b-col sm="10" class="formfieldview">
              {{sitepage.path}}
            </b-col>
          </b-row>
          <b-row no-gutters>
            <b-col sm="2">
              Title
            </b-col>
            <b-col sm="10" class="formfieldview">
              {{sitepage.title}}
            </b-col>
          </b-row>
          <b-row no-gutters>
            <b-col sm="2">
              Content
            </b-col>
            <b-col sm="10" class="formfieldview">
              <b-form-textarea plaintext :value="sitepage.content" max-rows="100" style="overflow-y: auto;"></b-form-textarea>
            </b-col>
          </b-row>
        </b-container>
      </b-list-group-item>
    </b-list-group>
    <b-modal id="bv-modal-site-page" size="xl" centered @ok="okSitePage">
      <template v-slot:modal-title>
        {{modaltitle}}
      </template>
      <form ref="form" @submit.stop.prevent>
        <b-form-group label="Path"
                      label-for="pagepath"
                      label-cols-sm="2">
          <b-form-input id="pagepath" v-model="pagepath" placeholder="Required" required></b-form-input>
        </b-form-group>
        <b-form-group label="Title"
                      label-for="pagetitle"
                      label-cols-sm="2">
          <b-form-input id="pagetitle" v-model="pagetitle" placeholder="Required" required></b-form-input>
        </b-form-group>
        <b-form-group label="Content"
                      label-for="pagecontent"
                      label-cols-sm="2">
          <b-form-textarea id="pagecontent"
                           v-model="pagecontent"
                           rows="10"
                           max-rows="100"
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
  const _ = require('lodash/core')
  import HelpSuperSitePages from '~/components/HelpSuperSitePages'
  import Messages from '~/components/Messages'

  const pagetitle = 'Site pages'
  page.title = pagetitle

  export default {
    middleware: 'authsuper',
    components: { Messages, HelpSuperSitePages },
    data({ app, params, store }) {
      //console.log('_id data')
      return {
        error: '',
        message: '',
        modaltitle: 'UNSET',
        pageid: 0,
        pagepath: '',
        pagetitle: '',
        pagecontent: ''
      }
    },
    async mounted() { // Client only
      this.error = ''
      this.message = ''
      this.$store.dispatch('sitepages/clearError')
      this.$store.dispatch('sitepages/fetch')
      page.title = pagetitle
      this.$store.commit("page/setTitle", pagetitle)
    },
    computed: {
      fatalerror() {
        return this.$store.getters['sitepages/error']
      },
      sitepages() {
        return this.$store.getters['sitepages/getall']()
      }
    },
    methods: {
      /* ************************ */
      setError(msg) {
        this.error = msg
      },
      /* ************************ */
      setMessage(msg) {
        this.message = msg
      },
      /* ************************ */
      toggleSitePageShow(sitepage) {
        sitepage.visible = !sitepage.visible
      },
      /* ************************ */
      async deleteSitePage(sitepage) {
        try {
          if (!await this.$bvModal.msgBoxConfirm('Are you sure you want to delete this site page?', { title: sitepage.path + ' - ' + sitepage.title })) return
          const ok = await this.$api.sitepages.deleteSitePage(sitepage.id)
          if (ok) {
            this.$store.dispatch('sitepages/fetch')
            this.$nextTick(() => {
              this.$bvModal.hide('bv-modal-site-page')
              this.$bvModal.msgBoxOk('Site page removed')
            })
          } else {
            await this.$bvModal.msgBoxOk('Remove went wrong', { title: 'FAIL', headerBgVariant: 'warning' })
          }
        } catch (e) {
          await this.$bvModal.msgBoxOk('Error adding site page: ' + e.message)
        }
      },
      /* ************************ */
      startAddSitePage() {
        this.modaltitle = 'Add site page'
        this.pageid = 0
        this.pagepath = ''
        this.pagetitle = ''
        this.pagecontent = ''
        this.$bvModal.show('bv-modal-site-page')
      },
      /* ************************ */
      startEditSitePage(sitepage) {
        this.modaltitle = 'Edit site page'
        this.pageid = sitepage.id
        this.pagepath = sitepage.path
        this.pagetitle = sitepage.title
        this.pagecontent = sitepage.content
        this.$bvModal.show('bv-modal-site-page')
      },
      /* ************************ */
      async okSitePage(bvModalEvt) {
        //console.log('okSitePage', this.pageid, this.pagepath, this.pagetitle, this.pagecontent)
        bvModalEvt.preventDefault()
        try {
          this.pagepath = this.pagepath.trim()
          this.pagetitle = this.pagetitle.trim()
          this.pagecontent = this.pagecontent.trim()
          if (this.pagepath.length === 0) return await this.$bvModal.msgBoxOk('Please give a path')
          if (this.pagetitle.length === 0) return await this.$bvModal.msgBoxOk('Please give a page title')
          if (this.pagecontent.length === 0) return await this.$bvModal.msgBoxOk('Please give some page content')

          const ok = await this.$api.sitepages.addEditSitePage(this.pageid, this.pagepath, this.pagetitle, this.pagecontent)

          if (ok) {
            this.$store.dispatch('sitepages/fetch')
            this.$nextTick(() => {
              this.$bvModal.hide('bv-modal-site-page')
              this.$bvModal.msgBoxOk('Site page added/edited')
            })
          } else {
            await this.$bvModal.msgBoxOk('Add/Edit went wrong', { title: 'FAIL', headerBgVariant: 'warning' })
          }
        } catch (e) {
          await this.$bvModal.msgBoxOk('Error adding site page: ' + e.message)
        }
      }
    },
    /* ************************ */
    head() {
      return {
        title: pagetitle
      }
    },
  }
</script>
