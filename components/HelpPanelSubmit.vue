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
        Here's details of this submission.
      </p>
      <ul>
        <li>Use the buttons to see your entries or add a new one</li>
        <li>Read any feedback.</li>
        <li>See the status of your submissions.</li>
        <li>If you are a reviewer, then you will see what work you need to do.</li>
      </ul>
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
        id: 'panel-submit'
      }
    },
    props: {
      custom: { type: String },
    },
  }
</script>
