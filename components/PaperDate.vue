<template>
    <span>
        {{ date }}
    </span>
</template>
<script>
export default {
    props: {
        dt: {
            type: String
        },
    },
    computed: {
        date() {
            if (this.dt === null) return ''
            const dt = new Date(this.dt)
            return dt.toLocaleString()
        }
    }
}
</script>
  