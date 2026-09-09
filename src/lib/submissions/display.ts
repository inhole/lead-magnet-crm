import type { FormFieldSchema } from "@/lib/forms/types"

function optionLabel(field: FormFieldSchema | undefined, value: string): string {
  return field?.options?.find((option) => option.value === value)?.label ?? value
}

export function formatSubmissionValue(field: FormFieldSchema | undefined, value: unknown): string {
  if (Array.isArray(value)) {
    if (!value.length) return "입력 없음"
    return value.filter((item) => typeof item === "string").map((item) => optionLabel(field, item)).join(", ")
  }
  if (typeof value === "boolean") return value ? "예" : "아니요"
  if (typeof value !== "string" || !value) return "입력 없음"
  return optionLabel(field, value)
}
