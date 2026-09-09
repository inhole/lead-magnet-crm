import type { Metadata } from "next"

import { SwaggerDocs } from "@/components/api-docs/swagger-docs"

export const metadata: Metadata = {
  title: "API 문서 | lead/magnet",
  description: "리드마그넷 CRM OpenAPI 문서",
}

export default function ApiDocsPage() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <header className="border-b bg-slate-950 px-6 py-5 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">lead/magnet</p>
          <h1 className="mt-1 text-2xl font-semibold">API 문서</h1>
          <p className="mt-1 text-sm text-slate-300">OpenAPI 3.1 · 운영자 세션과 공개 폼 API 계약</p>
        </div>
      </header>
      <div className="mx-auto max-w-7xl"><SwaggerDocs /></div>
    </main>
  )
}
