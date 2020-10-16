<template>
  <div>
    <div v-html="content">
    </div>
  </div>
</template>

<script>
  import { page } from '@/utils/phdcc'

  page.title = 'Welcome'

  export default {

    components: {
    },

    mounted() { // Client only
      this.$store.dispatch('sitepages/fetch')
      this.$store.commit("page/setTitle", page.title)
    },

    computed: {
      content() {
        const path = '/'+this.$route.params.id
        console.log('_id content path', path)
        const sitepage = this.$store.getters['sitepages/get'](path)
        if (sitepage) {
          page.title = sitepage.title
          return sitepage.content
        }
        return ''
      }
    },
    head() {
      return {
        title: page.title,
      }
    },
  }
</script>
