<template>
  <div class="mt-1 mb-1">
    <NoticeMessage v-if="showHelp" variant="info">
      <b-btn variant="link" class="float-right" @click="toggleHelp">
        <v-icon name="info-circle" scale="2" />
        Hide this
      </b-btn>
      <p v-if="custom">
        <strong>{{custom}}</strong>
      </p>
      <p>
        Use this page to download data about your publications' submissions
      </p>
      <ul></ul>
    </NoticeMessage>
    <div v-else class="text-primary text-right clickme" @click="toggleHelp">
      <v-icon name="question-circle" />
      Show help
    </div>
  </div>
</template>
<script>
  import NoticeMessage from './NoticeMessage'
  import helpBox from '@/mixins/helpBox'

  export default {
    components: { NoticeMessage },
    mixins: [helpBox],
    data: function () {
      return {
        id: 'admin-downloads'
      }
    },
    props: {
      custom: { type: String },
    },
  }
</script>
