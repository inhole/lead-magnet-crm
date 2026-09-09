import { describe, expect, it } from "vitest"
import type { FormFieldSchema } from "../../src/lib/forms/types"
import { validateSubmissionValues, validateUuid } from "../../src/lib/submissions/validation"

const fields: FormFieldSchema[] = [
  { name: "email", label: "이메일", type: "email", required: true },
  { name: "size", label: "규모", type: "select", required: true, options: [{ value: "1-10", label: "1~10명" }, { value: "11-50", label: "11~50명" }] },
  { name: "agree", label: "동의", type: "checkbox", required: true },
  { name: "channels", label: "관심 채널", type: "checkbox", required: false, options: [{ value: "email", label: "이메일" }, { value: "sms", label: "문자" }] },
]

describe("공개 신청 검증", () => {
  it("유효한 입력을 정규화한다", () => expect(validateSubmissionValues({ email: " user@example.com ", size: "1-10", agree: true, channels: ["email"] }, fields)).toEqual({ ok: true, values: { email: "user@example.com", size: "1-10", agree: true, channels: ["email"] } }))
  it("필수값과 타입을 검증한다", () => { const result = validateSubmissionValues({ email: "bad", size: "other", agree: false, channels: [] }, fields); expect(result.ok).toBe(false); if (!result.ok) expect(result.fieldErrors).toMatchObject({ email: expect.any(String), size: expect.any(String), agree: expect.any(String) }) })
  it("스키마에 없는 필드를 거부한다", () => expect(validateSubmissionValues({ email: "a@b.com", size: "1-10", agree: true, admin: "yes" }, fields).ok).toBe(false))
  it("체크박스 그룹의 목록 밖 값을 거부한다", () => { const result = validateSubmissionValues({ email: "a@b.com", size: "1-10", agree: true, channels: ["fax"] }, fields); expect(result.ok).toBe(false); if (!result.ok) expect(result.fieldErrors.channels).toEqual(expect.any(String)) })
  it("문자열 배열 형태의 기존 options도 허용한다", () => {
    const legacyFields = [{ name: "size", label: "규모", type: "select", required: true, options: ["1-10", "11-50"] }] as unknown as FormFieldSchema[]
    expect(validateSubmissionValues({ size: "1-10" }, legacyFields)).toEqual({ ok: true, values: { size: "1-10" } })
  })
  it("UUID만 방문 식별자로 허용한다", () => { expect(validateUuid("550e8400-e29b-41d4-a716-446655440000")).toBe(true); expect(validateUuid("not-a-uuid")).toBe(false) })
})
