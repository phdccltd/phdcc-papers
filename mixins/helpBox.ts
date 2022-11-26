import { useMiscStore } from "~/stores/misc";

console.log('init helpBox')

export default {
    data: function () {
      return {
        id: null
      }
    },
    computed: {
      helpKey () {
        return 'help-' + this.id
      },
      showHelp () {
        const miscStore = useMiscStore();
        const showingHelp = miscStore.get(this.helpKey) ?? false;
        return !showingHelp;
      }
    },
    methods: {
      toggleHelp () {
        const miscStore = useMiscStore();
        miscStore.set({
          key: this.helpKey,
          value: this.showHelp
        })
      }
    }
  }
  