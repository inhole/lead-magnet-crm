export const SUPPORTED_FIELD_TYPES = [
  "text",
  "email",
  "tel",
  "number",
  "textarea",
  "select",
  "checkbox",
  "radio",
] as const

export type FormFieldType = (typeof SUPPORTED_FIELD_TYPES)[number]

export type FormOption = {
  value: string
  label: string
}

export type FormFieldSchema = {
  name: string
  label: string
  type: FormFieldType
  required: boolean
  options?: FormOption[]
}

export type HtmlValidationError = {
  code: string
  message: string
}

export type HtmlValidationResult =
  | { ok: true; html: string; fields: FormFieldSchema[] }
  | { ok: false; errors: HtmlValidationError[] }

function normalizeOptions(options: unknown): FormOption[] | undefined {
  if (!Array.isArray(options)) return undefined
  return options.map((option) => (typeof option === "string" ? { value: option, label: option } : option as FormOption))
}

export function normalizeFormFields(fields: unknown): FormFieldSchema[] {
  if (!Array.isArray(fields)) return []
  return (fields as Array<Record<string, unknown>>).map((field) => ({
    name: String(field.name ?? ""),
    label: String(field.label ?? ""),
    type: field.type as FormFieldType,
    required: Boolean(field.required),
    ...(field.options !== undefined ? { options: normalizeOptions(field.options) } : {}),
  }))
}
