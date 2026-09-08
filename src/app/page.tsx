import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CampaignList } from "@/components/campaigns/campaign-list"

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link href="/" className="text-lg font-bold tracking-tight">
            lead<span className="text-muted-foreground">/</span>magnet
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="주 메뉴">
            <Link href="/" className={buttonVariants({ variant: "ghost" })}>캠페인</Link>
            <Link href="/templates/new" className={buttonVariants({ variant: "ghost" })}>템플릿</Link>
            <Link href="#overview" className={buttonVariants({ variant: "ghost" })}>성과</Link>
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">hello@inhole.dev</span>
            <Link href="/campaigns/new" className={buttonVariants({ className: "rounded-full" })}>새 캠페인 만들기</Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-10 lg:grid-cols-[1fr_280px] lg:px-10 lg:py-14">
        <section>
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Workspace / Campaigns</p>
              <h1 className="text-4xl font-bold tracking-[-0.04em] lg:text-5xl">캠페인</h1>
              <p className="mt-3 text-muted-foreground">리드마그넷의 흐름을 만들고, 신청 성과를 확인하세요.</p>
            </div>
            <Badge variant="secondary" className="hidden sm:inline-flex">Campaign workspace</Badge>
          </div>

          <CampaignList />
        </section>

        <aside id="overview" className="border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-8">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Overview</p>
          <div className="flex flex-col gap-7">
            <div><p className="text-sm text-muted-foreground">전체 신청</p><p className="mt-1 text-4xl font-bold tracking-tight">—</p></div>
            <div><p className="text-sm text-muted-foreground">전체 방문</p><p className="mt-1 text-4xl font-bold tracking-tight">—</p></div>
            <div><p className="text-sm text-muted-foreground">평균 전환율</p><p className="mt-1 text-4xl font-bold tracking-tight">—</p></div>
          </div>

          <Card className="mt-12">
            <CardHeader>
              <CardTitle>첫 캠페인을 시작하세요</CardTitle>
              <CardDescription>HTML 템플릿을 등록하고 나만의 신청 폼을 만들어 보세요.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/templates/new" className={buttonVariants({ variant: "secondary" })}>템플릿 등록하기</Link>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  )
}
