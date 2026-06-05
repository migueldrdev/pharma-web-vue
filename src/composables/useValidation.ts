type ValidationRule = (val: unknown) => boolean | string
type RuleBuilder = (...args: any[]) => ValidationRule

interface ValidationRules {
  required: (label?: string) => ValidationRule
  minLength: (min: number) => RuleBuilder
  maxLength: (max: number) => RuleBuilder
  email: ValidationRule
  numeric: ValidationRule
  integer: ValidationRule
  min: (min: number) => RuleBuilder
  max: (max: number) => RuleBuilder
  positive: ValidationRule
  nonNegative: ValidationRule
  phone: ValidationRule
  url: ValidationRule
  password: ValidationRule
  pattern: (regex: RegExp, message: string) => ValidationRule
  custom: (fn: (val: unknown) => boolean, message: string) => ValidationRule
}

export function useValidation(): ValidationRules {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const urlRegex = /^https?:\/\/.+/
  const phoneRegex = /^[\d\s\-+()]{9,}$/

  const required =
    (label: string = 'Este campo'): ValidationRule =>
    (val: unknown): boolean | string =>
      !!val || `${label} es requerido`

  const minLength =
    (min: number): ValidationRule =>
    (val: unknown): boolean | string => {
      const str = val as string
      return (str?.length ?? 0) >= min || `Mínimo ${min} caracteres`
    }

  const maxLength =
    (max: number): ValidationRule =>
    (val: unknown): boolean | string => {
      const str = val as string
      return (str?.length ?? 0) <= max || `Máximo ${max} caracteres`
    }

  const email: ValidationRule = (val: unknown): boolean | string =>
    !val || emailRegex.test(val as string) || 'Email inválido'

  const numeric: ValidationRule = (val: unknown): boolean | string =>
    val === null || val === undefined || val === '' || !isNaN(Number(val)) || 'Debe ser numérico'

  const integer: ValidationRule = (val: unknown): boolean | string =>
    val === null || val === undefined || val === '' || Number.isInteger(Number(val)) || 'Debe ser un número entero'

  const min =
    (minVal: number): ValidationRule =>
    (val: unknown): boolean | string => {
      const n = Number(val)
      return isNaN(n) || n >= minVal || `Mínimo ${minVal}`
    }

  const max =
    (maxVal: number): ValidationRule =>
    (val: unknown): boolean | string => {
      const n = Number(val)
      return isNaN(n) || n <= maxVal || `Máximo ${maxVal}`
    }

  const positive: ValidationRule = (val: unknown): boolean | string => {
    const n = Number(val)
    return isNaN(n) || n > 0 || 'Debe ser mayor a 0'
  }

  const nonNegative: ValidationRule = (val: unknown): boolean | string => {
    const n = Number(val)
    return isNaN(n) || n >= 0 || 'Debe ser 0 o mayor'
  }

  const phone: ValidationRule = (val: unknown): boolean | string =>
    !val || phoneRegex.test(val as string) || 'Teléfono inválido'

  const url: ValidationRule = (val: unknown): boolean | string =>
    !val || urlRegex.test(val as string) || 'URL inválida (debe comenzar con http:// o https://)'

  const password: ValidationRule = (val: unknown): boolean | string => {
    const str = val as string
    if (!str) return 'La contraseña es requerida'
    if (str.length < 8) return 'Mínimo 8 caracteres'
    return true
  }

  const pattern =
    (regex: RegExp, message: string): ValidationRule =>
    (val: unknown): boolean | string =>
      !val || regex.test(val as string) || message

  const custom =
    (fn: (val: unknown) => boolean, message: string): ValidationRule =>
    (val: unknown): boolean | string =>
      fn(val) || message

  return {
    required,
    minLength,
    maxLength,
    email,
    numeric,
    integer,
    min,
    max,
    positive,
    nonNegative,
    phone,
    url,
    password,
    pattern,
    custom,
  }
}
