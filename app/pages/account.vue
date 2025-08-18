<template>
  <div>
    <Messages :error="error" :message="message" />
    <div v-html="content">
    </div>
    <b-form @submit="onSubmit" @submit.stop.prevent>
      <b-row no-gutters>
        <b-col cols="3" class="col-form-label">
          Username:
        </b-col>
        <b-col cols="9" class="col-form-label">
          {{ username }}
        </b-col>
      </b-row>
      <b-form-group label="Name:" label-for="name" label-cols-sm="3" :state="true">
        <b-form-input id="name" v-model="form.name" autocomplete="name" placeholder="Enter name"></b-form-input>
      </b-form-group>
      <b-form-group label="Email:" label-for="email" label-cols-sm="3" :state="true">
        <b-form-input id="email" v-model="form.email" type="email" placeholder="Enter email"></b-form-input>
      </b-form-group>
      <b-form-group label="New password:" label-for="password" label-cols-sm="3" :state="true">
        <b-form-input id="password" v-model="form.password" type="password" autocomplete="new-password" placeholder="Optionally enter a new password">
        </b-form-input>
      </b-form-group>
      <b-row no-gutters>
        <b-col cols="9" offset-md="3">
          <b-button type="submit" variant="primary" data-cy="account-save">Save</b-button>
        </b-col>
      </b-row>
    </b-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'
import { useSitePagesStore } from '~/stores/sitepages'
import api from '~/api'

const authStore = useAuthStore()
const miscStore = useMiscStore()
const sitePagesStore = useSitePagesStore()

const form = ref({
  name: authStore.name,
  email: authStore.email,
  password: '',
})

const error = ref('')
const message = ref('')

onMounted(async () => {
  await sitePagesStore.fetch()
  if (!authStore.loggedin) {
    navigateTo('/login')
  }
  miscStore.set({ key: 'page-title', value: 'Account' })
})

const content = computed(() => {
  const sitepage = sitePagesStore.get('/account')
  return sitepage ? sitepage.content : ''
})

const username = computed(() => {
  return authStore.username
})

async function onSubmit() {
  error.value = ''
  message.value = ''
  form.value.name = form.value.name.trim()
  form.value.email = form.value.email.trim()
  
  if (form.value.name.length === 0) { 
    error.value = 'No name given'
    return 
  }
  
  if (form.value.email.length === 0) { 
    error.value = 'No email given'
    return 
  }
  
  const changedName = form.value.name !== authStore.name
  const changedEmail = form.value.email !== authStore.email
  const changedPassword = form.value.password
  
  if (!changedName && !changedEmail && !changedPassword) {
    error.value = 'No changes'
    return
  }
  
  try {
    const response = await api.auth.save(form.value)
    if (response.ret !== 0) {
      error.value = response.status
    } else {
      const user = await api.auth.getuser()
      authStore.setUser(user.user)
      message.value = 'Changes saved'
    }
  }
  catch (err: any) {
    console.log("ACCOUNT FAIL", err.message)
    error.value = err.message
  }
}
</script>