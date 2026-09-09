import { describe, expect, it } from "vitest"

import { environmentFromStatus } from "../../scripts/ci/supabase_env.mjs"

describe("Supabase CI 환경 변환", () => {
  it("CLI JSON을 서버와 공개 환경변수로 변환한다", () => {
    const values = environmentFromStatus({ API_URL: "http://127.0.0.1:54321", ANON_KEY: "anon", SERVICE_ROLE_KEY: "service" })
    expect(values.SUPABASE_URL).toBe("http://127.0.0.1:54321")
    expect(values.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).toBe("anon")
    expect(values.SUPABASE_SERVICE_ROLE_KEY).toBe("service")
  })

  it("필수 값이 없거나 URL이 잘못되면 실패한다", () => {
    expect(() => environmentFromStatus({ API_URL: '"http://127.0.0.1:54321"', ANON_KEY: "anon", SERVICE_ROLE_KEY: "service" })).toThrow()
  })
})
