import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { TemplateList } from "@/components/forms/template-list"

export default function TemplatesPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Workspace / Templates</p>
          <h1 className="text-4xl font-bold tracking-[-0.04em]">HTML 템플릿</h1>
          <p className="mt-3 text-muted-foreground">등록한 HTML과 입력 항목을 확인하고 커스텀 신청 폼에 사용하세요.</p>
        </div>
        <Link href="/templates/new" className={buttonVariants()}>새 템플릿 등록</Link>
      </div>
      <TemplateList />
    </main>
  )
}
