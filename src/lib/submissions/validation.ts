import type { FormFieldSchema } from "@/lib/forms/types"
import { normalizeFormFields } from "@/lib/forms/types"

export type SubmissionValue = string | string[] | boolean

export function validateUuid(value: unknown) {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

export function validateSubmissionValues(input: unknown, rawFields: FormFieldSchema[]) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { ok: false as const, fieldErrors: { form: "입력값을 확인하세요." } }
  const fields = normalizeFormFields(rawFields)
  const record = input as Record<string, unknown>
  const allowed = new Set(fields.map((field) => field.name))
  const fieldErrors: Record<string, string> = {}
  const values: Record<string, SubmissionValue> = {}
  for (const key of Object.keys(record)) if (!allowed.has(key)) fieldErrors[key] = "허용되지 않은 입력 항목입니다."
  for (const field of fields) {
    const raw = record[field.name]
    if (field.type === "checkbox") {
      const optionValues = field.options?.map((option) => option.value)
      if (optionValues) {
        const value = Array.isArray(raw) && raw.every((item) => typeof item === "string") ? raw : []
        if (value.some((item) => !optionValues.includes(item))) fieldErrors[field.name] = "목록에서 값을 선택하세요."
        else if (field.required && !value.length) fieldErrors[field.name] = "필수 항목입니다."
        else values[field.name] = value
        continue
      }
      const value = typeof raw === "boolean" ? raw : false
      if (field.required && !value) fieldErrors[field.name] = "필수 항목입니다."
      else values[field.name] = value
      continue
    }
    const value = typeof raw === "string" ? raw.trim() : ""
    if (field.required && !value) fieldErrors[field.name] = "필수 항목입니다."
    else if (value.length > 2000) fieldErrors[field.name] = "입력값이 너무 깁니다."
    else if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) fieldErrors[field.name] = "이메일 형식을 확인하세요."
    else if (field.type === "number" && value && !Number.isFinite(Number(value))) fieldErrors[field.name] = "숫자를 입력하세요."
    else if ((field.type === "select" || field.type === "radio") && value && !field.options?.some((option) => option.value === value)) fieldErrors[field.name] = "목록에서 값을 선택하세요."
    else values[field.name] = value
  }
  return Object.keys(fieldErrors).length ? { ok: false as const, fieldErrors } : { ok: true as const, values }
}
