import Link from "next/link"

import { HtmlUpload } from "@/components/forms/html-upload"

export default function NewTemplatePage() {
  return (
    <main className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link href="/" className="text-lg font-bold tracking-tight">lead<span className="text-muted-foreground">/</span>magnet</Link>
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">캠페인으로 돌아가기</Link>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Templates / New</p>
        <h1 className="text-4xl font-bold tracking-[-0.04em]">HTML 템플릿 등록</h1>
        <p className="mb-10 mt-3 text-muted-foreground">커스텀 신청 폼의 구조를 검사하고 격리된 화면에서 확인합니다.</p>
        <HtmlUpload />
      </div>
    </main>
  )
}
