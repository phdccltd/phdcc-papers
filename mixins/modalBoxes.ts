export default {
  data() {
    return {
      confirmTitle: '',
      confirmMessage: '',
      confirmCancelText: 'Cancel',
      confirmOKText: 'Confirm',
      confirmOK: () => { },
      confirmCancelled: () => { },
    }
  },
  created() {
  },
  destroyed() {
  },
  methods: {
    msgBoxOk(title: string, message?: string) {
      this.waitForRef('okmsgbox', async () => {
        this.$refs.okmsgbox.show(title, message)
      })
    },
    showConfirm(title: string, message: string, confirmOK: any, confirmOKText?: string, confirmCancelText?: string, confirmCancelled?: any) {
      this.confirmTitle = title
      this.confirmMessage = message
      this.confirmOK = confirmOK
      this.confirmOKText = confirmOKText ?? "Confirm"
      this.confirmCancelText = confirmCancelText ?? "Cancel"
      this.confirmCancelled = confirmCancelled ?? (() => { })
      this.waitForRef('confirm', async () => {
        this.$refs.confirm.show()
      })
    },
    confirmedOK() {
      this.confirmOK()
    },
    cancelConfirm() {
      this.confirmCancelled();
    }
  },
}
