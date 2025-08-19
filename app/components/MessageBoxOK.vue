<template>
  <div>
    <b-modal id="modal-msgbox-ok" ref="msgmodal" :title="msgTitle" :header-bg-variant="msgHeaderBgVariant" centered>
      <template v-if="msgMessage" #default data-cy="MessageBoxOK-message">
        {{ msgMessage }}
      </template>
      <template #footer>
        <b-button variant="primary" @click="ok" data-cy="MessageBoxOK-ok"> OK </b-button>
      </template>
    </b-modal>
  </div>
</template>
<script setup lang="ts">
import { msgmodal, msgshow, msgTitle, msgHeaderBgVariant, msgMessage } from '~/composables/useModalBoxes'

const emit = defineEmits([
  'ok'
])

onMounted(() => {
  msgshow()
})

function ok() {
  emit('ok')
  msghide()
}


</script>
  