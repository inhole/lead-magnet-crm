import { describe, expect, it } from "vitest"

import { toCounts } from "../../scripts/ci/playwright_counts.mjs"

describe("Playwright 건수 변환", () => {
  it("재시도 성공을 성공 건수로 포함한다", () => {
    expect(toCounts({ stats: { expected: 5, flaky: 1, unexpected: 2, skipped: 3 } })).toEqual({
      total: 11,
      passed: 6,
      failed: 2,
      errors: 0,
      skipped: 3,
    })
  })
})
