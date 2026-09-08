import { describe, expect, it } from "vitest"
import { validateSubmissionValues, validateUuid } from "../../src/lib/submissions/validation"

const fields = [
  { name: "email", label: "이메일", type: "email" as const, required: true },
  { name: "size", label: "규모", type: "select" as const, required: true, options: ["1-10", "11-50"] },
  { name: "agree", label: "동의", type: "checkbox" as const, required: true },
]

describe("공개 신청 검증", () => {
  it("유효한 입력을 정규화한다", () => expect(validateSubmissionValues({ email: " user@example.com ", size: "1-10", agree: true }, fields)).toEqual({ ok: true, values: { email: "user@example.com", size: "1-10", agree: true } }))
  it("필수값과 타입을 검증한다", () => { const result = validateSubmissionValues({ email: "bad", size: "other", agree: false }, fields); expect(result.ok).toBe(false); if (!result.ok) expect(result.fieldErrors).toMatchObject({ email: expect.any(String), size: expect.any(String), agree: expect.any(String) }) })
  it("스키마에 없는 필드를 거부한다", () => expect(validateSubmissionValues({ email: "a@b.com", size: "1-10", agree: true, admin: "yes" }, fields).ok).toBe(false))
  it("UUID만 방문 식별자로 허용한다", () => { expect(validateUuid("550e8400-e29b-41d4-a716-446655440000")).toBe(true); expect(validateUuid("not-a-uuid")).toBe(false) })
})
