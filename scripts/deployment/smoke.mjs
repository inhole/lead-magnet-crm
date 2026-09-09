import { pathToFileURL } from "node:url";

const checks = [
  {
    name: "비인증 루트 보호",
    path: "/",
    options: { redirect: "manual" },
    validate(response) {
      const location = response.headers.get("location");
      return response.status === 307 && location === "/login";
    },
    expected: "307 /login",
  },
  {
    name: "로그인 화면",
    path: "/login",
    validate: (response) => response.status === 200,
    expected: "200",
  },
  {
    name: "비인증 세션과 Supabase 설정",
    path: "/api/auth/me",
    async validate(response) {
      if (response.status !== 200) return false;
      const body = await response.json();
      return body.user === null && body.configured === true;
    },
    expected: "200, user=null, configured=true",
  },
  {
    name: "OpenAPI 원본",
    path: "/api/openapi",
    async validate(response) {
      if (response.status !== 200) return false;
      const body = await response.text();
      return body.includes("openapi: 3.1.0");
    },
    expected: "200, OpenAPI 3.1",
  },
  {
    name: "API 문서 화면",
    path: "/api-docs",
    async validate(response) {
      if (response.status !== 200) return false;
      const body = await response.text();
      return body.includes("API 문서");
    },
    expected: "200, API 문서 HTML",
  },
  {
    name: "공개 폼 DB 경계",
    path: "/api/public/forms/p09-smoke-not-found",
    async validate(response) {
      if (response.status !== 404) return false;
      const body = await response.json();
      return body.code === "NOT_FOUND";
    },
    expected: "404, NOT_FOUND",
  },
];

export function normalizeBaseUrl(value) {
  if (!value) throw new Error("배포 URL을 인자로 전달하세요.");

  const url = new URL(value);
  if (!new Set(["http:", "https:"]).has(url.protocol)) {
    throw new Error("배포 URL은 http 또는 https URL이어야 합니다.");
  }

  url.pathname = "/";
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/$/, "");
}

export async function runSmoke(baseUrl, fetchImpl = fetch) {
  const origin = normalizeBaseUrl(baseUrl);
  const results = [];

  for (const check of checks) {
    try {
      const response = await fetchImpl(`${origin}${check.path}`, check.options);
      const passed = await check.validate(response);
      results.push({
        name: check.name,
        passed,
        detail: passed ? check.expected : `예상: ${check.expected}, 실제: ${response.status}`,
      });
    } catch (error) {
      results.push({
        name: check.name,
        passed: false,
        detail: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return results;
}

async function main() {
  const results = await runSmoke(process.argv[2]);

  for (const result of results) {
    console.log(`${result.passed ? "PASS" : "FAIL"} | ${result.name} | ${result.detail}`);
  }

  const failed = results.filter((result) => !result.passed);
  console.log(`\n배포 스모크: ${results.length - failed.length}/${results.length}건 통과`);
  if (failed.length > 0) process.exitCode = 1;
}

const invokedPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (import.meta.url === invokedPath) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
