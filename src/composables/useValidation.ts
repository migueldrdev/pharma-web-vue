type ValidationRule = (val: unknown) => string | boolean;

interface ValidationRules {
  required: (label?: string) => ValidationRule
  minLength: (min: number) => ValidationRule
  maxLength: (max: number) => ValidationRule
  email: ValidationRule
  numeric: ValidationRule
  integer: ValidationRule
  min: (min: number) => ValidationRule
  max: (max: number) => ValidationRule
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
    (val: unknown): string | boolean =>
      !!val || `${label} es requerido`

  const minLength =
    (min: number): ValidationRule =>
    (val: unknown): string | boolean => {
      const str = val as string
      return (str?.length ?? 0) >= min || `Mínimo ${min} caracteres`
    }

  const maxLength =
    (max: number): ValidationRule =>
    (val: unknown): string | boolean => {
      const str = val as string
      return (str?.length ?? 0) <= max || `Máximo ${max} caracteres`
    }

  const emailRule: ValidationRule = (val: unknown): string | boolean =>
    !val || emailRegex.test(val as string) || 'Email inválido'

  const numeric: ValidationRule = (val: unknown): string | boolean =>
    val === null || val === undefined || val === '' || !isNaN(Number(val)) || 'Debe ser numérico'

  const integer: ValidationRule = (val: unknown): string | boolean =>
    val === null || val === undefined || val === '' || Number.isInteger(Number(val)) || 'Debe ser un número entero'

  const min =
    (minVal: number): ValidationRule =>
    (val: unknown): string | boolean => {
      const n = Number(val)
      return isNaN(n) || n >= minVal || `Mínimo ${minVal}`
    }

  const max =
    (maxVal: number): ValidationRule =>
    (val: unknown): string | boolean => {
      const n = Number(val)
      return isNaN(n) || n <= maxVal || `Máximo ${maxVal}`
    }

  const positive: ValidationRule = (val: unknown): string | boolean => {
    const n = Number(val)
    return isNaN(n) || n > 0 || 'Debe ser mayor a 0'
  }

  const nonNegative: ValidationRule = (val: unknown): string | boolean => {
    const n = Number(val)
    return isNaN(n) || n >= 0 || 'Debe ser 0 o mayor'
  }

  const phone: ValidationRule = (val: unknown): string | boolean =>
    !val || phoneRegex.test(val as string) || 'Teléfono inválido'

  const url: ValidationRule = (val: unknown): string | boolean =>
    !val || urlRegex.test(val as string) || 'URL inválida (debe comenzar con http:// o https://)'

  const password: ValidationRule = (val: unknown): string | boolean => {
    const str = val as string
    if (!str) return 'La contraseña es requerida'
    if (str.length < 8) return 'Mínimo 8 caracteres'
    return true
  }

  const pattern =
    (regex: RegExp, message: string): ValidationRule =>
    (val: unknown): string | boolean =>
      !val || regex.test(val as string) || message

  const custom =
    (fn: (val: unknown) => boolean, message: string): ValidationRule =>
    (val: unknown): string | boolean =>
      fn(val) || message

  return {
    required,
    minLength,
    maxLength,
    email: emailRule,
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
