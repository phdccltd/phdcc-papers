<template>
  <div class="custom-file b-form-file">
    <!-- Basic own version of BFormFile as this not in bootstrap-vue-3 yet -->
    <!-- https://github.com/bootstrap-vue/bootstrap-vue/tree/dev/src/components/form-file -->
    <input type="file" :id="computedId" :accept="accept" :class="computedClasses" @input.stop="onInput($event)" />
    <label :for="computedId" data-browse="Browse" class="custom-file-label">
      <span class="d-block form-file-text" style="pointer-events: none;">{{ displayedfilename }}</span>
    </label>
  </div>
</template>

<script lang="ts">
import { computed } from 'vue'

export default defineComponent({
  props: {
    id: { type: String, required: true },
    accept: { type: String, required: true },
    placeholder: { type: String, required: true },
    chosenfilename: { type: String, required: false },
  },
  data() {
    return {
    }
  },
  setup(props) {
    function getId(suffix = '') {
      console.log("getId")
      return `__BVID__${Math.random().toString().slice(2, 8)}___BV_${suffix}__`
    }

    function useId(id, suffix) { return computed(() => id?.value || getId(suffix)) }

    const computedId = useId(toRef(props, 'id'), 'file')
    // const isHighlighted = ref(false)

    const computedClasses = computed(() => {
      return {
        'custom-file-input': true,
        'is-valid': true,
      }
    })
    return {
      computedClasses,
      computedId,
    }
  },
  async mounted() {
    // Already fetched: lookups, portals, teams
  },
  computed: {
    displayedfilename() {
      return this.chosenfilename || this.placeholder
    }
  },
  methods: {
    onInput(evt: any) { // Must use @input.stop above to stop propagation
      // console.log("BFormFile onInput", evt.target.files)
      let file = null
      if (evt.target.files.length > 0) {
        file = evt.target.files[0]
      }

      this.$emit('input', file) // onInput handler then sets this.chosenfilename
    },
  }
})
</script>
