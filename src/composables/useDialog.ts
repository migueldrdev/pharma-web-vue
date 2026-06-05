import { Dialog } from 'quasar'
import type { QDialogOptions } from 'quasar'

type DialogType = 'success' | 'error' | 'warning' | 'info' | 'question' | 'critical'

interface DialogOptions {
  title: string
  message: string
  html?: boolean
  type?: DialogType
  okLabel?: string
  cancelLabel?: string
  okColor?: string
  cancelColor?: string
  persistent?: boolean
}

interface ConfirmResult {
  ok: boolean
  data?: unknown
}

const typeDefaults: Record<DialogType, { icon: string; color: string }> = {
  success: { icon: 'check_circle', color: 'positive' },
  error: { icon: 'error', color: 'negative' },
  warning: { icon: 'warning', color: 'warning' },
  info: { icon: 'info', color: 'info' },
  question: { icon: 'help', color: 'purple' },
  critical: { icon: 'gpp_maybe', color: 'deep-red' },
}

export function useDialog() {
  function confirm(options: DialogOptions): Promise<ConfirmResult> {
    const t = typeDefaults[options.type ?? 'info']

    return new Promise((resolve) => {
      Dialog.create({
        title: options.title,
        message: options.message,
        html: options.html ?? false,
        icon: t.icon,
        color: t.color,
        persistent: options.persistent ?? true,
        ok: {
          label: options.okLabel ?? 'Aceptar',
          color: options.okColor ?? t.color,
          flat: false,
          rounded: true,
        },
        cancel: {
          label: options.cancelLabel ?? 'Cancelar',
          color: options.cancelColor ?? 'grey',
          flat: true,
          rounded: true,
        },
      })
        .onOk((data?: unknown) => resolve({ ok: true, data }))
        .onCancel(() => resolve({ ok: false }))
        .onDismiss(() => resolve({ ok: false }))
    })
  }

  function alert(options: Omit<DialogOptions, 'cancelLabel'>): Promise<void> {
    const t = typeDefaults[options.type ?? 'info']

    return new Promise((resolve) => {
      Dialog.create({
        title: options.title,
        message: options.message,
        html: options.html ?? false,
        icon: t.icon,
        color: t.color,
        persistent: options.persistent ?? true,
        ok: {
          label: options.okLabel ?? 'Aceptar',
          color: options.okColor ?? t.color,
          flat: false,
          rounded: true,
        },
        cancel: false,
      })
        .onOk(() => resolve())
        .onDismiss(() => resolve())
    })
  }

  function prompt(
    title: string,
    opts: {
      label?: string
      placeholder?: string
      value?: string
      type?: 'text' | 'password' | 'number'
      rules?: ((v: string) => boolean | string)[]
      persistent?: boolean
    } = {}
  ): Promise<string | null> {
    return new Promise((resolve) => {
      Dialog.create({
        title,
        message: opts.placeholder ?? '',
        prompt: {
          model: opts.value ?? '',
          type: opts.type ?? 'text',
          label: opts.label,
        },
        persistent: opts.persistent ?? true,
        ok: { label: 'Aceptar', color: 'primary', rounded: true },
        cancel: { label: 'Cancelar', color: 'grey', flat: true, rounded: true },
      })
        .onOk((data: unknown) => resolve(data as string))
        .onCancel(() => resolve(null))
    })
  }

  function confirmDelete(entityName: string): Promise<boolean> {
    return new Promise((resolve) => {
      Dialog.create({
        title: 'Confirmar eliminación',
        message: `¿Estás seguro de eliminar ${entityName}? Esta acción no se puede deshacer.`,
        html: false,
        icon: 'delete',
        color: 'negative',
        persistent: true,
        ok: {
          label: 'Eliminar',
          color: 'negative',
          flat: false,
          rounded: true,
        },
        cancel: {
          label: 'Cancelar',
          color: 'grey',
          flat: true,
          rounded: true,
        },
      })
        .onOk(() => resolve(true))
        .onCancel(() => resolve(false))
        .onDismiss(() => resolve(false))
    })
  }

  function success(msg: string): Promise<void> {
    return alert({ title: 'Éxito', message: msg, type: 'success' })
  }

  function errorMsg(msg: string): Promise<void> {
    return alert({ title: 'Error', message: msg, type: 'error' })
  }

  function warning(msg: string): Promise<boolean> {
    return confirm({ title: 'Advertencia', message: msg, type: 'warning' }).then((r) => r.ok)
  }

  function info(msg: string): Promise<void> {
    return alert({ title: 'Información', message: msg, type: 'info' })
  }

  return { confirm, alert, prompt, confirmDelete, success, error: errorMsg, warning, info }
}
