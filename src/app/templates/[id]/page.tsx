import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { TemplateDetail } from "@/components/forms/template-detail"

export default async function TemplateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <main className="mx-auto min-h-screen max-w-7xl px-6 py-10 lg:px-10 lg:py-14"><div className="mb-10 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Templates / Detail</p><h1 className="text-4xl font-bold tracking-[-0.04em]">HTML 템플릿 상세</h1><p className="mt-3 text-muted-foreground">입력 항목과 실제 폼 디자인을 확인합니다.</p></div><Link href="/templates" className={buttonVariants({ variant: "outline" })}>목록으로</Link></div><TemplateDetail templateId={id} /></main>
}
