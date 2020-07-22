<template>
  <div class="mt-1 mb-1">
    <NoticeMessage v-if="showHelp" variant="primary">
      <b-btn variant="link" class="float-right" @click="toggleHelp">
        <v-icon name="info-circle" scale="2" />
        Hide this
      </b-btn>
      <p>
        Here's a summary of all your conferences/journals.
      </p>
      <ul>
        <li>Click on the conference button to work on your conference/journal.</li>
        <li>In the top menu, use the Account button to change your password.</li>
        <li>Panel takes you back here and Logout does just that.</li>
      </ul>
      <p class="mt-2">
        If you have any questions <a href="https://www.phdcc.com/feedback.html" target="_blank">please get in touch</a>.
      </p>
      <p>
        Please note the <a href="https://conf.phdcc.co.uk/privacy.html" target="_blank">privacy policy</a> which applies to publication/conference/journal contributors and organisers (ie you).
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
        id: 'panel'
      }
    },
  }
</script>
<style>
</style>
