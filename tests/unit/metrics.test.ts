import { describe, expect, it } from "vitest"
import { calculateMetric } from "../../src/lib/metrics/calculate"

describe("성과 지표", () => {
  it("재방문을 방문에는 포함하고 고유 방문자에서는 제외한다", () => {
    expect(calculateMetric([{ visitorId: "a", channel: "instagram" }, { visitorId: "a", channel: "instagram" }, { visitorId: "b", channel: "x" }], [{ visitorId: "a", channel: "instagram" }])).toEqual({ visits: 3, visitors: 2, submissions: 1, convertedVisitors: 1, conversionRate: 50 })
  })
  it("방문자가 없으면 전환율은 0이다", () => expect(calculateMetric([], [])).toEqual({ visits: 0, visitors: 0, submissions: 0, convertedVisitors: 0, conversionRate: 0 }))
  it("같은 방문자의 복수 신청은 전환 방문자 한 명으로 계산한다", () => expect(calculateMetric([{ visitorId: "a", channel: "direct" }], [{ visitorId: "a", channel: "direct" }, { visitorId: "a", channel: "direct" }]).conversionRate).toBe(100))
})
