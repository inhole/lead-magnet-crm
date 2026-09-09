import { describe, expect, it } from "vitest"

import { applyTemplateDefaults } from "@/lib/forms/copy-defaults"

const defaults = { title: "새 제목", description: "새 안내", submitLabel: "새 버튼" }

describe("applyTemplateDefaults", () => {
  it("손대지 않은 필드는 새 기본값으로 채운다", () => {
    const current = { title: "", description: "", submitLabel: "신청하기" }
    expect(applyTemplateDefaults(current, new Set(), defaults)).toEqual(defaults)
  })

  it("사용자가 고친 필드는 템플릿을 바꿔도 유지한다", () => {
    const current = { title: "직접 고친 제목", description: "", submitLabel: "신청하기" }
    expect(applyTemplateDefaults(current, new Set(["title"]), defaults)).toEqual({ title: "직접 고친 제목", description: "새 안내", submitLabel: "새 버튼" })
  })

  it("모든 필드를 고쳤으면 기본값을 적용하지 않는다", () => {
    const current = { title: "A", description: "B", submitLabel: "C" }
    expect(applyTemplateDefaults(current, new Set(["title", "description", "submitLabel"]), defaults)).toEqual(current)
  })
})
