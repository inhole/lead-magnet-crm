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

export type FormFieldSchema = {
  name: string
  label: string
  type: FormFieldType
  required: boolean
  options?: string[]
}

export type HtmlValidationError = {
  code: string
  message: string
}

export type HtmlValidationResult =
  | { ok: true; html: string; fields: FormFieldSchema[] }
  | { ok: false; errors: HtmlValidationError[] }
