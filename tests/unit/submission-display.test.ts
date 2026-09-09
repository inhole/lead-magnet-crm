import { describe, expect, it } from "vitest"

import { normalizeFormFields } from "@/lib/forms/types"
import { formatSubmissionValue } from "@/lib/submissions/display"

const selectField = { name: "role", label: "직무", type: "select" as const, required: true, options: [{ value: "marketing", label: "마케팅" }, { value: "sales", label: "영업" }] }
const channelsField = { name: "channels", label: "수신 채널", type: "checkbox" as const, required: false, options: [{ value: "email", label: "이메일" }, { value: "sms", label: "문자" }] }
const agreeField = { name: "agree", label: "동의", type: "checkbox" as const, required: true }

describe("formatSubmissionValue", () => {
  it("셀렉트 값을 사람이 읽는 라벨로 바꾼다", () => expect(formatSubmissionValue(selectField, "marketing")).toBe("마케팅"))
  it("체크박스 그룹의 선택된 값들만 라벨로 이어 붙인다", () => expect(formatSubmissionValue(channelsField, ["email", "sms"])).toBe("이메일, 문자"))
  it("단일 체크박스는 예·아니요로 표시한다", () => { expect(formatSubmissionValue(agreeField, true)).toBe("예"); expect(formatSubmissionValue(agreeField, false)).toBe("아니요") })
  it("빈 값은 입력 없음으로 표시한다", () => { expect(formatSubmissionValue(selectField, "")).toBe("입력 없음"); expect(formatSubmissionValue(channelsField, [])).toBe("입력 없음") })
  it("필드 정보가 없으면 원시 값을 그대로 보여준다", () => expect(formatSubmissionValue(undefined, "raw")).toBe("raw"))
})

describe("normalizeFormFields", () => {
  it("문자열 배열 options를 value·label 객체로 바꾼다", () => {
    const legacy = [{ name: "role", label: "직무", type: "select", required: true, options: ["marketing", "sales"] }]
    expect(normalizeFormFields(legacy)).toEqual([{ name: "role", label: "직무", type: "select", required: true, options: [{ value: "marketing", label: "marketing" }, { value: "sales", label: "sales" }] }])
  })
  it("이미 객체 형태인 options는 그대로 둔다", () => {
    expect(normalizeFormFields([selectField])).toEqual([selectField])
  })
})
