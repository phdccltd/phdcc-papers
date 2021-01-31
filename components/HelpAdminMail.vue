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
        Use this page to send mails to user(s)
      </p>
      <ul>
        <li>Either choose a role - or All users or All submitters.</li>
        <li>Or choose a user</li>
        <li>If you want, choose one of the prepared mail templates to start the mail text</li>
        <li>Enter a subject and the text of the mail</li>
        <li>Only plain text is allowed and no substitutions are done</li>
        <li>Press Send when ready</li>
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
        id: 'admin-mail'
      }
    },
    props: {
      custom: { type: String },
    },
  }
</script>
