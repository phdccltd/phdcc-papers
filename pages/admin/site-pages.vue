<template>
  <div>
    <!-- ADMIN SITE PAGES -->
    <!-- Access check: correctly fails as API returns error if not allowed -->
    <b-alert v-if="fatalerror" variant="warning" :show="true">
      ERROR {{ fatalerror }}
    </b-alert>
    <HelpSuperSitePages />
    <Messages :error="error" :message="message" />
    <b-container class="bg-yellow p-3">
      <b-row no-gutters>
        <b-col sm="6">
          <b-button variant="outline-success" @click="startAddSitePage()">
            Add site page
          </b-button>
        </b-col>
        <b-col sm="6">
        </b-col>
      </b-row>
    </b-container>
    <b-list-group class="sitepages">
      <b-list-group-item v-for="(sitepage, index) in sitepages" :key="index" class="">
        <h3 class="sitepage-submit-h3">
          <b-link @click.prevent="deleteSitePage(sitepage)" class="me-2">
            <v-icon icon="times-circle" class="btn-outline-danger" />
          </b-link>
          <b-link @click.prevent="toggleSitePageShow(sitepage)">
            {{ sitepage.id }}: {{ sitepage.path }} - {{ sitepage.title }}
          </b-link>
          <NuxtLink target="_blank" :to="sitepage.path" class="float-end">
            <v-icon icon="external-link-alt" class="btn-outline-warning" />
          </NuxtLink>
          <b-button variant="link" @click="startEditSitePage(sitepage)">
            <v-icon icon="edit" class="btn-outline-warning" />
          </b-button>
        </h3>
        <b-container v-if="sitepage.visible">
          <b-row no-gutters>
            <b-col sm="2">
              Path
            </b-col>
            <b-col sm="10" class="formfieldview">
              {{ sitepage.path }}
            </b-col>
          </b-row>
          <b-row no-gutters>
            <b-col sm="2">
              Title
            </b-col>
            <b-col sm="10" class="formfieldview">
              {{ sitepage.title }}
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

    <b-modal v-model="showSitePageModal" id="bv-modal-site-page" centered>
      <template #header>
        {{ modaltitle }}
      </template>
      <template #default>
        <form ref="form" @submit.stop.prevent>
          <b-form-group label="Path" label-for="pagepath" label-cols-sm="2">
            <b-form-input id="pagepath" v-model="pagepath" placeholder="Required" required></b-form-input>
          </b-form-group>
          <b-form-group label="Title" label-for="pagetitle" label-cols-sm="2">
            <b-form-input id="pagetitle" v-model="pagetitle" placeholder="Required" required></b-form-input>
          </b-form-group>
          <b-form-group label="Content" label-for="pagecontent" label-cols-sm="2">
            <b-form-textarea id="pagecontent" v-model="pagecontent" rows="10" max-rows="100" style="overflow-y: auto;" placeholder="Required"
              required>
            </b-form-textarea>
          </b-form-group>
        </form>
      </template>
      <template #footer>
        <b-button variant="outline-secondary" @click="cancelModal"> Cancel </b-button>
        <b-button variant="primary" @click="okSitePage"> OK </b-button>
      </template>
    </b-modal>
    <MessageBoxOK ref="okmsgbox" />
    <ConfirmModal ref="confirm" :title="confirmTitle" :message="confirmMessage" :cancelText="confirmCancelText" :confirmText="confirmOKText"
      :okVariant="okVariant" @confirm="confirmedOK" @cancel="cancelConfirm" />
  </div>
</template>

<script lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'
import { usePubsStore } from '~/stores/pubs'
import { useSitePagesStore } from '~/stores/sitepages'
import { useSubmitsStore } from '~/stores/submits'
import { useUsersStore } from '~/stores/users'
import api from '~/api'
import modalBoxes from '@/mixins/modalBoxes'

definePageMeta({
  middleware: 'authsuper',
})

export default {
  inject: { setLayoutMessage: {} },
  mixins: [modalBoxes],
  setup() {
    const authStore = useAuthStore()
    const miscStore = useMiscStore()
    const pubsStore = usePubsStore()
    const submitsStore = useSubmitsStore()
    const sitepagesStore = useSitePagesStore()
    const usersStore = useUsersStore()

    return { authStore, miscStore, pubsStore, sitepagesStore, submitsStore, usersStore }
  },
  data() {
    //console.log('_id data')
    return {
      error: '',
      message: '',
      modaltitle: 'UNSET',
      pageid: 0,
      pagepath: '',
      pagetitle: '',
      pagecontent: '',
      confirmsitepage: null,
      showSitePageModal: false,
    }
  },
  async mounted() { // Client only
    this.setLayoutMessage()
    this.error = ''
    this.message = ''
    this.sitepagesStore.error = false
    await this.sitepagesStore.fetch()
    this.miscStore.set({ key: 'page-title', value: 'Site pages' })
},
  computed: {
    fatalerror() {
      return this.sitepagesStore.error
    },
    sitepages() {
      return this.sitepagesStore.list
    }
  },
  methods: {
    setError(msg) {
      this.error = msg
    },
    setMessage(msg) {
      this.message = msg
    },
    cancelModal() {
      this.showSitePageModal = false
    },
    toggleSitePageShow(sitepage) {
      sitepage.visible = !sitepage.visible
    },
    deleteSitePage(sitepage) {
      this.confirmsitepage = sitepage
      this.showConfirm(sitepage.path + ' - ' + sitepage.title, 'Are you sure you want to delete this site page?', this.confirmDeleteSitePage)
    },
    async confirmDeleteSitePage() {
      try {
        const ok = await api.sitepages.deleteSitePage(this.confirmsitepage.id)
        if (ok) {
          await this.sitepagesStore.fetch()
          this.$nextTick(() => {
            this.msgBoxOk('Site page removed')
          })
        } else {
          this.msgBoxOk('FAIL', 'Remove went wrong', 'warning')
        }
      } catch (e) {
        this.msgBoxError('Error adding site page: ' + e.message)
      }
    },
    startAddSitePage() {
      this.modaltitle = 'Add site page'
      this.pageid = 0
      this.pagepath = ''
      this.pagetitle = ''
      this.pagecontent = ''
      this.showSitePageModal = true
    },
    startEditSitePage(sitepage) {
      this.modaltitle = 'Edit site page'
      this.pageid = sitepage.id
      this.pagepath = sitepage.path
      this.pagetitle = sitepage.title
      this.pagecontent = sitepage.content
      this.showSitePageModal = true
    },
    async okSitePage() {
      //console.log('okSitePage', this.pageid, this.pagepath, this.pagetitle, this.pagecontent)
      try {
        this.pagepath = this.pagepath.trim()
        this.pagetitle = this.pagetitle.trim()
        this.pagecontent = this.pagecontent.trim()
        if (this.pagepath.length === 0) return this.msgBoxOk('Please give a path')
        if (this.pagetitle.length === 0) return this.msgBoxOk('Please give a page title')
        if (this.pagecontent.length === 0) return this.msgBoxOk('Please give some page content')

        const ok = await api.sitepages.addEditSitePage(this.pageid, this.pagepath, this.pagetitle, this.pagecontent)

        if (ok) {
          await this.sitepagesStore.fetch()
          this.$nextTick(() => {
            this.showSitePageModal = false
            this.msgBoxOk('Site page added/edited')
          })
        } else {
          this.msgBoxFail('Add/Edit went wrong')
        }
      } catch (e) {
        this.msgBoxError('Error adding site page: ' + e.message)
      }
    }
  },
}
</script>
