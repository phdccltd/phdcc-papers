export default {
  data() {
    return {
      confirmTitle: '',
      confirmMessage: '',
      confirmCancelText: 'Cancel',
      confirmOKText: 'Confirm',
      confirmOK: () => { },
      confirmCancelled: () => { },
      okVariant: 'primary',
    }
  },
  created() {
  },
  destroyed() {
  },
  methods: {
    msgBoxOk(title: string, message?: string, headerBgVariant?: string) {
      this.waitForRef('okmsgbox', async () => {
        this.$refs.okmsgbox.show(title, message, headerBgVariant)
      })
    },
    msgBoxFail(message?: string) {
      this.waitForRef('okmsgbox', async () => {
        this.$refs.okmsgbox.show('Oops', message, 'warning')
      })
    },
    msgBoxError(message?: string) {
      this.waitForRef('okmsgbox', async () => {
        this.$refs.okmsgbox.show('Darn', message, 'danger')
      })
    },
    showConfirm(title: string, message: string, confirmOK: any, confirmOKText?: string, confirmCancelText?: string, confirmCancelled?: any, confirmokvariant?: string) {
      this.confirmTitle = title
      this.confirmMessage = message
      this.confirmOK = confirmOK
      this.confirmOKText = confirmOKText ?? "Confirm"
      this.confirmCancelText = confirmCancelText ?? "Cancel"
      this.confirmCancelled = confirmCancelled ?? (() => { })
      this.okVariant = confirmokvariant ?? 'primary'
      this.waitForRef('confirm', async () => {
        this.$refs.confirm.show()
      })
    },
    confirmedOK() {
      this.confirmOK()
    },
    cancelConfirm() {
      this.confirmCancelled()
    }
  },
}
