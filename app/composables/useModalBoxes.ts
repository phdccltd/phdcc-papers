export const showMsgModal = ref(false)
export const msgmodal = ref()
export function msgshow() {
  msgmodal.value?.show()
}
export function msghide() {
  msgmodal.value?.hide()
  showMsgModal.value = false
}
export const msgTitle = ref('')
export const msgHeaderBgVariant = ref('')
export const msgMessage = ref('')


export const showConfirmModal = ref(false)
export const confirmmodal = ref()
const confirmIsShown = ref(false)

export function confirmshow() {
  confirmmodal.value?.show()
  confirmIsShown.value = true
}

export function confirmhide() {
  confirmmodal.value?.hide()
  confirmIsShown.value = false
}

export const confirmTitle = ref('')
export const confirmMessage = ref('')
export const confirmCancelText = ref('Cancel')
export const confirmOKText = ref('Confirm')
export const okVariant = ref('primary')
export const confirmOK = ref(() => { })
export const confirmCancelled = ref(() => { })

export function msgBoxOk(title: string, message?: string, headerBgVariant?: string) {
  msgTitle.value = title ?? 'OK'
  msgMessage.value = message ?? ''
  msgHeaderBgVariant.value = headerBgVariant ?? ''
  showMsgModal.value = true
}

export function msgBoxFail(message?: string) {
  msgTitle.value = 'Oops'
  msgMessage.value = message ?? ''
  msgHeaderBgVariant.value = 'warning'
  showMsgModal.value = true
}

export function msgBoxError(message?: string) {
  msgTitle.value = 'Darn'
  msgMessage.value = message ?? ''
  msgHeaderBgVariant.value = 'danger'
  showMsgModal.value = true
}

export function showConfirm(title: string, message: string, confirmOKfn: any, OKText?: string, cancelText?: string, confirmCancelledfn?: any, confirmokvariant?: string) {
  confirmTitle.value = title
  confirmMessage.value = message
  confirmOK.value = confirmOKfn
  confirmOKText.value = OKText ?? "Confirm"
  confirmCancelText.value = cancelText ?? "Cancel"
  confirmCancelled.value = confirmCancelledfn ?? (() => { })
  okVariant.value = confirmokvariant ?? 'primary'
  showConfirmModal.value = true
}

export function confirmedOK() {
  confirmOK.value()
  showConfirmModal.value = false
}

export function cancelConfirm() {
  confirmCancelled.value()
  showConfirmModal.value = false
}