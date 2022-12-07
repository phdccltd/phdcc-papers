<template>
  <div class="custom-file b-form-file">
    <!-- https://github.com/bootstrap-vue/bootstrap-vue/tree/dev/src/components/form-file -->
    <input type="file" :id="computedId" accept=".txt, .pdf, .doc, .docx" :class="computedClasses" />
    <label :for="computedId" data-browse="Browse" class="custom-file-label">
      <span class="d-block form-file-text" style="pointer-events: none;">Required. </span>
    </label>

    // form-file-text
    <!-- v-bind="$attrs" @input="onInput($event)"
      @change="onChange($event)" @blur="onBlur($event)" />
    
      input :id="computedId" ref="input" :class="computedClasses" :name="name || undefined" :form="form || undefined" :type="localType"
    :disabled="disabled" :placeholder="placeholder" :required="required" :autocomplete="autocomplete || undefined" :readonly="readonly || plaintext"
    :min="min" :max="max" :step="step" :list="type !== 'password' ? list : undefined" :aria-required="required ? 'true' : undefined"
    :aria-invalid="computedAriaInvalid" v-bind="$attrs" @input="onInput($event)" @change="onChange($event)" @blur="onBlur($event)" /-->
  </div>
</template>

<script lang="ts">
import { computed, ComputedRef, Ref } from 'vue'

export default defineComponent({
  props: {
    id: { type: String, required: true },
    accept: { type: String, required: true },
    placeholder: { type: String, required: true },
  },
  emits: ['update:modelValue', 'change', 'blur', 'input'],
  setup(props, { emit }) {
    /*const { input, computedId, computedAriaInvalid, onInput, onChange, onBlur, focus, blur } =
      useFormInput(props, emit)
    */
    function getId(suffix = '') {
      console.log("getId")
      return `__BVID__${Math.random().toString().slice(2, 8)}___BV_${suffix}__`
    }

    function useId(id?: Ref<string | undefined>, suffix?: string) { return computed(() => id?.value || getId(suffix))}

    const computedId = useId(toRef(props, 'id'), 'file')
    const isHighlighted = ref(false)

    const computedClasses = computed(() => {
      return {
        'custom-file-input': true,
        'is-valid': true,
      }
      /*const isRange = props.type === 'range'
      const isColor = props.type === 'color'
      return {
        'form-control-highlighted': isHighlighted.value,
        'form-range': isRange,
        'form-control': isColor || (!props.plaintext && !isRange),
        'form-control-color': isColor,
        'form-control-plaintext': props.plaintext && !isRange && !isColor,
        [`form-control-${props.size}`]: !!props.size,
        'is-valid': props.state === true,
        'is-invalid': props.state === false,
      }*/
    })
    /*
    const localType = computed<InputType>(() =>
      allowedTypes.includes(props.type) ? props.type : 'text'
    )

    const highlight = () => {
      if (isHighlighted.value === true) return
      isHighlighted.value = true
      setTimeout(() => {
        isHighlighted.value = false
      }, 2000)
    }

    return {
      computedClasses,
      localType,
      input,
      computedId,
      computedAriaInvalid,
      onInput,
      onChange,
      onBlur,
      focus,
      blur,
      highlight,
    }*/
    return {
      computedClasses,
      computedId,
    }
  },
  methods: {
  }
})
</script>
