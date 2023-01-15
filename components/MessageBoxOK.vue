<template>
  <div>
    <b-modal id="modal-msgbox-ok" v-model="showModal" :title="title" :header-bg-variant="headerBgVariant" centered>
      <template v-if="message" #default data-cy="MessageBoxOK-message">
        {{ message }}
      </template>
      <template #footer>
        <b-button variant="primary" @click="ok" data-cy="MessageBoxOK-ok"> OK </b-button>
      </template>
    </b-modal>
  </div>
</template>
<script lang="ts">
// https://cdmoro.github.io/bootstrap-vue-3/components/Modal.html
import modal from '@/mixins/modal'

export default {
  mixins: [modal],
  data() {
    return {
      title: "",
      message: '',
      headerBgVariant: null,
    }
  },
  methods: {
    hide() {
      this.$emit('hide')
      this.showModal = false
    },
    show(title: string, message?: string, headerBgVariant?: string) {
      this.title = title
      this.message = message
      this.headerBgVariant = headerBgVariant
      this.showModal = true
    },
  },
}
</script>
  