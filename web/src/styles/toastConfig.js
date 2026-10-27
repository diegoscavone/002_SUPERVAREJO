import { alertNotify } from '@/components/AlertNotification'

export function toastSuccess(message, title) {
  alertNotify.success(message, title)
}

export function toastError(message, title) {
  alertNotify.error(message, title)
}

export function toastInfo(message, title) {
  alertNotify.info(message, title)
}

export function toastWarning(message, title) {
  alertNotify.warning(message, title)
}