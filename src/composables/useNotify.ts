import { Notify } from 'quasar'
import type { QNotifyCreateOptions } from 'quasar'

interface NotifyExtraOptions {
  caption?: string
  html?: boolean
  timeout?: number
  position?: QNotifyCreateOptions['position']
  group?: string | false
  actions?: QNotifyCreateOptions['actions']
}

export function useNotify() {
  function success(message: string, opts: NotifyExtraOptions = {}): void {
    Notify.create({
      type: 'success',
      message,
      ...opts,
    } as QNotifyCreateOptions)
  }

  function error(message: string, opts: NotifyExtraOptions = {}): void {
    Notify.create({
      type: 'error',
      message,
      timeout: opts.timeout ?? 5000,
      ...opts,
    } as QNotifyCreateOptions)
  }

  function warning(message: string, opts: NotifyExtraOptions = {}): void {
    Notify.create({
      type: 'warning',
      message,
      ...opts,
    } as QNotifyCreateOptions)
  }

  function info(message: string, opts: NotifyExtraOptions = {}): void {
    Notify.create({
      type: 'info',
      message,
      ...opts,
    } as QNotifyCreateOptions)
  }

  function question(message: string, opts: NotifyExtraOptions = {}): void {
    Notify.create({
      type: 'question',
      message,
      timeout: 0,
      ...opts,
    } as QNotifyCreateOptions)
  }

  function critical(message: string, opts: NotifyExtraOptions = {}): void {
    Notify.create({
      type: 'critical',
      message,
      timeout: opts.timeout ?? 6000,
      ...opts,
    } as QNotifyCreateOptions)
  }

  function loading(message: string = 'Cargando...') {
    const dismiss = Notify.create({
      type: 'ongoing',
      message,
      position: 'bottom-right',
      timeout: 0,
      spinner: true,
      group: false,
      progress: false,
    })

    return {
      update(msg: string): void {
        dismiss({ message: msg, type: 'ongoing', spinner: true })
      },
      dismissFn(): void {
        dismiss({ type: 'positive', message, timeout: 300, spinner: false })
      },
    }
  }

  function fromBackend(type: string, message: string): void {
    const handlers: Record<string, (msg: string) => void> = {
      success: (msg: string) => success(msg),
      error: (msg: string) => error(msg),
      warning: (msg: string) => warning(msg),
      info: (msg: string) => info(msg),
      critical: (msg: string) => critical(msg),
      positive: (msg: string) => success(msg),
      negative: (msg: string) => error(msg),
      danger: (msg: string) => error(msg),
    }

    const handler = handlers[type]
    if (handler) {
      handler(message)
    } else {
      info(message)
    }
  }

  return { success, error, warning, info, question, critical, loading, fromBackend }
}
