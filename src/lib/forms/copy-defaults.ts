import type { FormCopy } from "@/lib/forms/render-template"

export type FormCopyField = keyof FormCopy

export function applyTemplateDefaults<T extends FormCopy>(current: T, touched: ReadonlySet<FormCopyField>, defaults: FormCopy): T {
  const next = { ...current }
  for (const field of Object.keys(defaults) as FormCopyField[]) {
    if (!touched.has(field)) next[field] = defaults[field]
  }
  return next
}
