import { readdir, readFile } from "node:fs/promises"
import path from "node:path"

import { describe, expect, it } from "vitest"
import { parse } from "yaml"

type Operation = { responses?: Record<string, unknown>; security?: unknown[] }
type Specification = { openapi?: string; paths?: Record<string, Record<string, Operation>> }

const expectedOperations: Record<string, string[]> = {
  "/api/metrics": ["get"],
  "/api/auth/login": ["post"],
  "/api/auth/logout": ["post"],
  "/api/auth/me": ["get"],
  "/api/templates": ["get", "post"],
  "/api/templates/{id}/preview": ["get"],
  "/api/templates/validate": ["post"],
  "/api/templates/sample": ["get"],
  "/api/campaigns": ["get", "post"],
  "/api/campaigns/{id}": ["get", "patch"],
  "/api/campaigns/{id}/links": ["get", "post"],
  "/api/campaigns/{id}/metrics": ["get"],
  "/api/campaigns/{id}/submissions": ["get"],
  "/api/campaigns/{id}/submissions/{submissionId}": ["get"],
  "/api/public/forms/{publicId}": ["get"],
  "/api/public/forms/{publicId}/visits": ["post"],
  "/api/public/forms/{publicId}/submissions": ["post"],
}

async function routeFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map((entry) => entry.isDirectory() ? routeFiles(path.join(directory, entry.name)) : [path.join(directory, entry.name)]))
  return nested.flat().filter((file) => file.endsWith("route.ts"))
}

async function implementedOperations() {
  const apiRoot = path.join(process.cwd(), "src", "app", "api")
  const files = (await routeFiles(apiRoot)).filter((file) => !file.endsWith(path.join("openapi", "route.ts")) && !file.includes(`${path.sep}swagger-assets${path.sep}`))
  return Object.fromEntries(await Promise.all(files.map(async (file) => {
    const route = `/api/${path.relative(apiRoot, path.dirname(file)).replaceAll("\\", "/").replace(/\[([^\]]+)\]/g, "{$1}")}`.replace(/\/$/, "")
    const source = await readFile(file, "utf8")
    const methods = [...source.matchAll(/export async function (GET|POST|PUT|PATCH|DELETE)\b/g)].map((match) => match[1].toLowerCase()).sort()
    return [route, methods]
  })))
}

describe("OpenAPI 계약", () => {
  it("유효한 3.1 명세이며 구현된 모든 업무 API 경로와 메서드를 포함한다", async () => {
    const source = await readFile(path.join(process.cwd(), "docs", "api", "openapi.yaml"), "utf8")
    const specification = parse(source) as Specification
    expect(specification.openapi).toBe("3.1.0")
    expect(specification.paths).toBeDefined()

    const documented = Object.fromEntries(Object.entries(specification.paths ?? {}).map(([route, item]) => [route, Object.keys(item).filter((key) => ["get", "post", "put", "patch", "delete"].includes(key)).sort()]))
    expect(documented).toEqual(Object.fromEntries(Object.entries(expectedOperations).map(([route, methods]) => [route, methods.sort()])))

    expect(await implementedOperations()).toEqual(documented)
  })

  it("모든 operation이 성공과 실패 응답을 선언하고 운영자 데이터 API는 세션을 요구한다", async () => {
    const specification = parse(await readFile(path.join(process.cwd(), "docs", "api", "openapi.yaml"), "utf8")) as Specification
    for (const [route, methods] of Object.entries(expectedOperations)) {
      for (const method of methods) {
        const operation = specification.paths?.[route]?.[method]
        expect(operation?.responses, `${method.toUpperCase()} ${route}`).toBeDefined()
        expect(Object.keys(operation?.responses ?? {}).some((status) => status.startsWith("2")), `${method.toUpperCase()} ${route} 성공 응답`).toBe(true)
        if (!["/api/auth/logout", "/api/auth/me", "/api/templates/sample"].includes(route)) {
          expect(Object.keys(operation?.responses ?? {}).some((status) => status.startsWith("4") || status.startsWith("5")), `${method.toUpperCase()} ${route} 실패 응답`).toBe(true)
        }
        if (route === "/api/metrics" || (route.startsWith("/api/templates") && route !== "/api/templates/sample" && route !== "/api/templates/validate") || route.startsWith("/api/campaigns")) expect(operation?.security, `${method.toUpperCase()} ${route} 인증`).toEqual([{ cookieAuth: [] }])
      }
    }
  })
})
