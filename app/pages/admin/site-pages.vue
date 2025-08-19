<template>
  <div>
    <!-- ADMIN SITE PAGES -->
    <!-- Access check: correctly fails as API returns error if not allowed -->
    <b-alert v-if="fatalerror" variant="warning" :modelValue="true">
      ERROR {{ fatalerror }}
    </b-alert>
    <HelpSuperSitePages />
    <Messages :error="error" :message="message" />
    <b-container class="bg-yellow p-3">
      <b-row no-gutters>
        <b-col sm="6">
          <b-button variant="outline-success" @click="startAddSitePage()" data-cy="startAddSitePage">
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
          <b-link @click.prevent="deleteSitePage(sitepage)" class="me-2" :data-cy="'deleteSitePage-' + sitepage.id">
            <v-icon icon="times-circle" class="btn-outline-danger" />
          </b-link>
          <b-link @click.prevent="toggleSitePageShow(sitepage)" :data-cy="'sitePageTitle-' + sitepage.id">
            {{ sitepage.id }}: {{ sitepage.path }} - {{ sitepage.title }}
          </b-link>
          <NuxtLink target="_blank" :to="sitepage.path" class="float-end">
            <v-icon icon="external-link-alt" class="btn-outline-warning" />
          </NuxtLink>
          <b-button variant="link" @click="startEditSitePage(sitepage)" :data-cy="'editSitePage-' + sitepage.id">
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
            <b-col sm="10" class="formfieldview" :data-cy="'sitePageVisibleContent-' + sitepage.id">
              <p v-for="para in sitepage.paras" class="pre-textarea mb-0">{{ para }}</p>
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
        <form ref="form" @submit.stop.prevent data-cy="showSitePageModal">
          <b-form-group label="Path" label-for="pagepath" label-cols-sm="2" :state="true">
            <b-form-input id="pagepath" v-model="pagepath" placeholder="Required" required></b-form-input>
          </b-form-group>
          <b-form-group label="Title" label-for="pagetitle" label-cols-sm="2" :state="true">
            <b-form-input id="pagetitle" v-model="pagetitle" placeholder="Required" required></b-form-input>
          </b-form-group>
          <b-form-group label="Content" label-for="pagecontent" label-cols-sm="2" :state="true">
            <b-form-textarea id="pagecontent" v-model="pagecontent" rows="10" max-rows="100" style="overflow-y: auto;" placeholder="Required" required>
            </b-form-textarea>
          </b-form-group>
        </form>
      </template>
      <template #footer>
        <b-button variant="outline-secondary" @click="cancelModal" data-cy="cancelSitePage"> Cancel </b-button>
        <b-button variant="primary" @click="okSitePage" data-cy="okSitePage"> OK </b-button>
      </template>
    </b-modal>
    <MessageBoxOK v-if="showMsgModal" />
    <ConfirmModal v-if="showConfirmModal" @confirm="confirmedOK" @cancel="cancelConfirm"  />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'
import { usePubsStore } from '~/stores/pubs'
import { useSitePagesStore } from '~/stores/sitepages'
import { useSubmitsStore } from '~/stores/submits'
import { useUsersStore } from '~/stores/users'
import api from '~/api'
import { showMsgModal, msgBoxOk, msgBoxFail, msgBoxError, showConfirmModal, showConfirm, confirmedOK, cancelConfirm } from '~/composables/useModalBoxes'

definePageMeta({
  middleware: 'authsuper',
})

const authStore = useAuthStore()
const miscStore = useMiscStore()
const pubsStore = usePubsStore()
const submitsStore = useSubmitsStore()
const sitepagesStore = useSitePagesStore()
const usersStore = useUsersStore()

const error = ref('')
const message = ref('')
const modaltitle = ref('UNSET')
const pageid = ref(0)
const pagepath = ref('')
const pagetitle = ref('')
const pagecontent = ref('')
const confirmsitepage = ref<any>(null)
const showSitePageModal = ref(false)

onMounted(async () => { // Client only
  error.value = ''
  message.value = ''
  sitepagesStore.error = false
  await sitepagesStore.fetch()
  miscStore.set({ key: 'page-title', value: 'Site pages' })
})

const fatalerror = computed(() => {
  return sitepagesStore.error
})

const sitepages = computed(() => {
  return sitepagesStore.list
})

function setError(msg: string) {
  error.value = msg
}

function setMessage(msg: string) {
  message.value = msg
}

function cancelModal() {
  showSitePageModal.value = false
}

function toggleSitePageShow(sitepage: any) {
  sitepage.visible = !sitepage.visible
}

function deleteSitePage(sitepage: any) {
  confirmsitepage.value = sitepage
  showConfirm(sitepage.path + ' - ' + sitepage.title, 'Are you sure you want to delete this site page?', confirmDeleteSitePage)
}

async function confirmDeleteSitePage() {
  try {
    const ok = await api.sitepages.deleteSitePage(confirmsitepage.value.id)
    if (ok) {
      await sitepagesStore.fetch()
      nextTick(() => {
        msgBoxOk('Site page removed')
      })
    } else {
      msgBoxOk('FAIL', 'Remove went wrong', 'warning')
    }
  } catch (e: any) {
    msgBoxError('Error adding site page: ' + e.message)
  }
}

function startAddSitePage() {
  modaltitle.value = 'Add site page'
  pageid.value = 0
  pagepath.value = ''
  pagetitle.value = ''
  pagecontent.value = ''
  showSitePageModal.value = true
}

function startEditSitePage(sitepage: any) {
  modaltitle.value = 'Edit site page'
  pageid.value = sitepage.id
  pagepath.value = sitepage.path
  pagetitle.value = sitepage.title
  pagecontent.value = sitepage.content
  showSitePageModal.value = true
}

async function okSitePage() {
  //console.log('okSitePage', pageid.value, pagepath.value, pagetitle.value, pagecontent.value)
  try {
    pagepath.value = pagepath.value.trim()
    pagetitle.value = pagetitle.value.trim()
    pagecontent.value = pagecontent.value.trim()
    if (pagepath.value.length === 0) return msgBoxOk('Please give a path')
    if (pagetitle.value.length === 0) return msgBoxOk('Please give a page title')
    if (pagecontent.value.length === 0) return msgBoxOk('Please give some page content')

    const ok = await api.sitepages.addEditSitePage(pageid.value, pagepath.value, pagetitle.value, pagecontent.value)

    if (ok) {
      await sitepagesStore.fetch()
      nextTick(() => {
        showSitePageModal.value = false
        msgBoxOk('Site page added/edited')
      })
    } else {
      msgBoxFail('Add/Edit went wrong')
    }
  } catch (e: any) {
    msgBoxError('Error adding site page: ' + e.message)
  }
}
</script>
