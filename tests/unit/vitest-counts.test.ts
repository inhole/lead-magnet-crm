import { describe, expect, it } from "vitest"
import { toCounts } from "../../scripts/ci/vitest_counts.mjs"

describe("Vitest 건수 변환", () => {
  it("Vitest JSON을 한글 Summary 계약으로 변환한다", () => {
    expect(toCounts({ numTotalTests: 8, numPassedTests: 6, numFailedTests: 1, numPendingTests: 1 })).toEqual({
      total: 8, passed: 6, failed: 1, errors: 0, skipped: 1,
    })
  })
})