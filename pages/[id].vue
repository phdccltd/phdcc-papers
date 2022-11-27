<template>
    <div>
        <!-- MOSTLY DONE -->
        <div v-html="content">
        </div>
    </div>
</template>
  
<script lang="ts">
import { useSitePagesStore } from "~/stores/sitepages";
//import { page } from '@/utils/page'

//page.title = 'Welcome'

export default {

    setup() {
        const sitePagesStore = useSitePagesStore()
        return { sitePagesStore }
    },
    async mounted() { // Client only
        this.sitePagesStore.fetch() // Do not await as knackers useVueRecaptcha. WHY? TODO
        //this.$store.commit("page/setTitle", page.title)
    },

    computed: {
        content() {
            const route = useRoute()
            const path = '/' + route.params.id
            // console.log('_id content path', path)
            const sitepage: { content: string } = this.sitePagesStore.get(path)
            if (sitepage) {
                //page.title = sitepage.title
                //this.$store.commit("page/setTitle", page.title)
                return sitepage.content
            }
            return sitepage ? sitepage.content : '';
        }
    },
    //head() {
    //    return {
    //        title: page.title,
    //    }
    //},
}
</script>
  