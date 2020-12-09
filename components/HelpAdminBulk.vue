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
        Use this page to do bulk operations on submits, ie
      </p>
      <ul>
        <li>Move all submits forward by adding a new status.</li>
      </ul>
      <p>
        You might then use the <a href="admin-mail">send email</a> admin option to inform all users in a particular role eg to ask them to score abstracts.
      </p>
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
<style>
</style>
