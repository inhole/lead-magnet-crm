import { describe, expect, it } from "vitest"

import { publicFormPath, validateCampaignInput, validateCampaignPublication } from "../../src/lib/campaigns/validation"

const validInput = {
  name: "가을 리드 캠페인",
  templateId: "d9428888-122b-4cf8-b84b-cc8b43ef3247",
  title: "무료 체크리스트 받기",
  description: "업무 이메일로 보내드려요.",
  submitLabel: "체크리스트 신청",
}

describe("캠페인 입력 검증", () => {
  it("유효한 입력의 공백을 정리한다", () => {
    const result = validateCampaignInput({ ...validInput, name: "  가을 리드 캠페인  " })
    expect(result).toEqual({ ok: true, value: validInput })
  })

  it("빈 이름과 잘못된 템플릿 식별자를 거부한다", () => {
    const result = validateCampaignInput({ ...validInput, name: "", templateId: "not-a-uuid" })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.fieldErrors).toMatchObject({ name: expect.any(String), templateId: expect.any(String) })
  })

  it("과도한 안내 문구를 거부한다", () => {
    const result = validateCampaignInput({ ...validInput, description: "가".repeat(1001) })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.fieldErrors.description).toContain("1000자")
  })

  it("공개 경로의 식별자를 안전하게 인코딩한다", () => {
    expect(publicFormPath("public/id")).toBe("/f/public%2Fid")
  })

  it("캠페인 공개 상태는 boolean만 허용한다", () => {
    expect(validateCampaignPublication({ published: true })).toEqual({ ok: true, published: true })
    expect(validateCampaignPublication({ published: "true" })).toEqual({ ok: false })
  })
})
