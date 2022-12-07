<template>
  <b-modal id="confirmmodal" v-model="showModal" :title="title" centered>
    <template #default>
      <div v-html="message" />
    </template>
    <template #footer>
      <b-button v-if="showcancel" variant="white" @click="cancel"> {{ cancelText }} </b-button>
      <b-button variant="primary" @click="confirm"> {{ confirmText }} </b-button>
    </template>
  </b-modal>
</template>
<script>
import modal from '@/mixins/modal'

export default {
  mixins: [modal],
  props: {
    title: {
      type: String,
      required: false,
      default: 'Are you sure?',
    },
    message: {
      type: String,
      required: false,
      default: '<p>Are you sure you want to do this?</p>',
    },
    confirmText: {
      type: String,
      required: false,
      default: 'Confirm',
    },
    cancelText: {
      type: String,
      required: false,
      default: 'Cancel',
    },
  },
  data() {
    return {
      showModal: false,
    }
  },
  computed: {
    showcancel() {
      return this.cancelText.length > 0
    },
  },
  methods: {
    cancel() {
      this.$emit('cancel')
      this.hide()
    },
    confirm() {
      this.$emit('confirm')
      this.hide()
    },
  },
}
</script>
  