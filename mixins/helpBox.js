//console.log('init helpBox')

export default {
  data: function() {
    return {
      id: null
    }
  },
  computed: {
    helpKey() {
      return 'help-' + this.id
    },
    showHelp() {
      return !this.$store.getters['misc/get'](this.helpKey)
    }
  },
  methods: {
    toggleHelp() {
      //console.log('helpBox toggleHelp', this.helpKey, this.showHelp)
      this.$store.dispatch('misc/set', {
        key: this.helpKey,
        value: this.showHelp
      })
    }
  }
}
