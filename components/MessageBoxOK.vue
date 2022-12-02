<template>
  <div>
    <client-only>
      <b-modal id="modal-msgbox-ok" v-model="showModal" :title="title" size="lg" centered>
        <template v-if="message" #default>
          {{ message }}
        </template>
        <template #footer>
          <b-button variant="primary" @click="ok"> OK </b-button>
        </template>
      </b-modal>
    </client-only>
  </div>
</template>
<script lang="ts">
import modal from '@/mixins/modal'

export default {
  mixins: [modal],
  data() {
    var d: { title: string; message: string | undefined } = { title: "", message: '' };
    return d;
  },
  methods: {
    hide() {
      this.$emit('hide')
      this.showModal = false
    },
    show(title: string, message?: string) {
      this.title = title
      this.message = message
      this.showModal = true
    },
  },
}
</script>
  