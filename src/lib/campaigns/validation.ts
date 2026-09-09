export const CAMPAIGN_LIMITS = {
  name: 120,
  title: 160,
  description: 1000,
  submitLabel: 40,
} as const

export type CampaignInput = {
  name: string
  templateId: string
  title: string
  description: string
  submitLabel: string
}

export type CampaignValidationResult =
  | { ok: true; value: CampaignInput }
  | { ok: false; fieldErrors: Partial<Record<keyof CampaignInput, string>> }

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function validateCampaignInput(input: unknown): CampaignValidationResult {
  if (!input || typeof input !== "object") {
    return { ok: false, fieldErrors: { name: "캠페인 정보를 입력하세요." } }
  }

  const record = input as Record<string, unknown>
  const value: CampaignInput = {
    name: typeof record.name === "string" ? record.name.trim() : "",
    templateId: typeof record.templateId === "string" ? record.templateId.trim() : "",
    title: typeof record.title === "string" ? record.title.trim() : "",
    description: typeof record.description === "string" ? record.description.trim() : "",
    submitLabel: typeof record.submitLabel === "string" ? record.submitLabel.trim() : "",
  }
  const fieldErrors: Partial<Record<keyof CampaignInput, string>> = {}

  if (!value.name) fieldErrors.name = "캠페인 이름을 입력하세요."
  else if (value.name.length > CAMPAIGN_LIMITS.name) fieldErrors.name = `캠페인 이름은 ${CAMPAIGN_LIMITS.name}자 이하여야 합니다.`
  if (!UUID_PATTERN.test(value.templateId)) fieldErrors.templateId = "사용할 템플릿을 선택하세요."
  if (!value.title) fieldErrors.title = "공개 폼 제목을 입력하세요."
  else if (value.title.length > CAMPAIGN_LIMITS.title) fieldErrors.title = `제목은 ${CAMPAIGN_LIMITS.title}자 이하여야 합니다.`
  if (value.description.length > CAMPAIGN_LIMITS.description) fieldErrors.description = `안내 문구는 ${CAMPAIGN_LIMITS.description}자 이하여야 합니다.`
  if (!value.submitLabel) fieldErrors.submitLabel = "제출 버튼 문구를 입력하세요."
  else if (value.submitLabel.length > CAMPAIGN_LIMITS.submitLabel) fieldErrors.submitLabel = `버튼 문구는 ${CAMPAIGN_LIMITS.submitLabel}자 이하여야 합니다.`

  return Object.keys(fieldErrors).length ? { ok: false, fieldErrors } : { ok: true, value }
}

export function publicFormPath(publicId: string) {
  return `/f/${encodeURIComponent(publicId)}`
}

export function validateCampaignPublication(input: unknown) {
  if (!input || typeof input !== "object" || typeof (input as Record<string, unknown>).published !== "boolean") {
    return { ok: false as const }
  }
  return { ok: true as const, published: (input as { published: boolean }).published }
}
