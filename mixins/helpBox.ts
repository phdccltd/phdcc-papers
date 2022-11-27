import { useMiscStore } from "~/stores/misc";

export default {
    data: function () {
      return {
        id: ''
      }
    },
    computed: {
      helpKey (): string {
        return 'help-' + this.id
      },
      showHelp (): boolean {
        const miscStore = useMiscStore();
        const showingHelp = miscStore.get(this.helpKey) ?? false;
        return !showingHelp;
      }
    },
    methods: {
      toggleHelp (): void {
        const miscStore = useMiscStore();
        miscStore.set({
          key: this.helpKey,
          value: this.showHelp
        })
      }
    }
  }
  