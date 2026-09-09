import { describe, expect, it, vi } from "vitest";

import { normalizeBaseUrl, runSmoke } from "../../scripts/deployment/smoke.mjs";

describe("deployment smoke", () => {
  it("배포 URL을 origin으로 정규화한다", () => {
    expect(normalizeBaseUrl("https://example.com/path?query=1")).toBe("https://example.com");
    expect(() => normalizeBaseUrl("ftp://example.com")).toThrow("http 또는 https");
  });

  it("공개 배포 경계를 모두 검증한다", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const path = new URL(input instanceof Request ? input.url : input).pathname;

      if (path === "/") {
        return new Response(null, { status: 307, headers: { location: "/login" } });
      }
      if (path === "/api/auth/me") {
        return Response.json({ user: null, configured: true });
      }
      if (path === "/api/openapi") {
        return new Response("openapi: 3.1.0");
      }
      if (path === "/api-docs") {
        return new Response("<title>API 문서</title>");
      }
      if (path === "/api/public/forms/p09-smoke-not-found") {
        return Response.json({ code: "NOT_FOUND" }, { status: 404 });
      }
      return new Response("login");
    });

    const results = await runSmoke("https://example.com", fetchMock);

    expect(results).toHaveLength(6);
    expect(results.every((result) => result.passed)).toBe(true);
  });

  it("응답 계약이 다르면 실패로 기록한다", async () => {
    const results = await runSmoke(
      "https://example.com",
      vi.fn(async () => new Response("unexpected", { status: 200 })),
    );

    expect(results.some((result) => !result.passed)).toBe(true);
  });
});
