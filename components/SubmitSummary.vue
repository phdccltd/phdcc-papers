<template>
    <div>
        Submit summary
    </div>
</template> 
<script lang="ts">
import { usePubsStore } from '~/stores/pubs'
import PaperDate from '~/components/PaperDate.vue'
import Grading from '~/components/Grading.vue'
import GradingSummary from '~/components/GradingSummary.vue'
import _ from 'lodash/core'
export default {
    props: {
        showtype: {
            type: Number,
            required: true,
        },
        pub: {
            required: true,
        },
        flow: {
            required: true,
        },
        submit: {
            required: true,
        },
        showingadminoptions: {
            type: Boolean,
            required: true,
        },
        editSubmit: {
            type: Function,
        },
        setError: {
            type: Function,
            required: true,
        },
        setMessage: {
            type: Function,
            required: true,
        },
    },
    data: function () {
        return {
            visible: true,
            showsubmissions: true,
            showreviewers: true,
            showstatuses: true,
            showgradings: true,
            submitaction: null,
            helptext: false,
            helplinktext: false,
            helplink: false,
            decision: 0,
            decisionoptions: [],
            cancomment: false,
            comment: '',
            canopttoreview: false,
            canreview: false,
            flowgradeid: 0,
        }
    },
    mounted() {
        if (this.showtype == 4) this.visible = false
    },
    computed: {
        pubid() {
            const route = useRoute()
            return parseInt(route.params.pubid)
        },
        newstatusoptions() {
            const options = []
            for (const flowstatus of this.flow.statuses) {
                options.push({ value: flowstatus.id, text: flowstatus.status })
            }
            return options
        },
        newrevieweroptions() {
            const options = []
            for (const reviewer of this.pub.reviewers) {
                const already = _.find(this.submit.reviewers, _already => { return _already.userId === reviewer.id })
                if (!already) {
                    options.push({ value: reviewer.id, text: reviewer.name + ' - ' + reviewer.roles })
                }
            }
            return options
        },
    }
}
</script>