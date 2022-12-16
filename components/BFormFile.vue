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
import { computed, Ref } from 'vue'

export default defineComponent({
  props: {
    id: { type: String, required: true },
    accept: { type: String, required: true },
    placeholder: { type: String, required: true },
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

    function useId(id?: Ref<string | undefined>, suffix?: string) { return computed(() => id?.value || getId(suffix)) }

    const computedId = useId(toRef(props, 'id'), 'file')
    const isHighlighted = ref(false)

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
  computed: {
    displayedfilename() {
      return this.placeholder
    }
  },
  methods: {
    onInput(evt: any) { // Must use @input.stop above to stop propogation
      const file = evt.target.files[0]
      this.displayedfilename = file.name
      this.$emit('input', file)
    },
  }
})
</script>
