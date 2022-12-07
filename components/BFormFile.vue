<template>
  <div class="custom-file b-form-file">
    <!-- https://github.com/bootstrap-vue/bootstrap-vue/tree/dev/src/components/form-file -->
    <input type="file" :id="computedId" :accept="accept" :class="computedClasses" @input="onInput($event)" @change="onChange($event)"
      @blur="onBlur($event)" /> <!-- v-on:input="input" v-on:change="change" -->
    <label :for="computedId" data-browse="Browse" class="custom-file-label">
      <span class="d-block form-file-text" style="pointer-events: none;">{{displayedfilename}}</span>
    </label>

    <!-- <form-file-text dragenter, dragleave, dragover, drop, focusin, focusout, reset -->
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
    //modelValue: { type: File },
  },
  data(){
    return {
      displayedfilename: 'Required',
    }
  },
  //emits: ['update:modelValue', 'change', 'blur', 'input'],
  setup(props, { emit }) {
    /*const { input, computedId, computedAriaInvalid, onInput, onChange, onBlur, focus, blur } =
      useFormInput(props, emit)
    */
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
    onInput(evt) {
      const value = evt.target.files[0]
      console.log("BFormFile.onINPUT",value)
      evt.preventDefault()
      this.displayedfilename = value.name
      this.$emit('input', value)
    },
    onChange(evt) {
      console.log("BFormFile.onCHANGE")
      const {value} = evt.target as HTMLInputElement
      evt.preventDefault()
    },
    onBlur($event) {
      console.log("BFormFile.onBLUR")
    },
    change(event) {
      //console.log("BFormFile.CHANGE",event.target.files[0])
      //this.$emit('update:modelValue', event.target.files[0])
    },
    //input(event){
    //  console.log("BFormFile.INPUT",event)
    //  this.$emit('update:modelValue', event)
    //}
  }
})
</script>
