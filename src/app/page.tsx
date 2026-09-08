import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const campaigns = [
  { name: "9월 뉴스레터 구독", status: "진행 중", leads: 128, visits: 842, date: "2026. 09. 08" },
  { name: "무료 마케팅 체크리스트", status: "진행 중", leads: 64, visits: 391, date: "2026. 09. 05" },
  { name: "초기 창업자 인터뷰", status: "보관됨", leads: 37, visits: 215, date: "2026. 08. 29" },
]

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
            <Link href="#" className={buttonVariants({ className: "rounded-full" })}>새 캠페인 만들기</Link>
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
            <Badge variant="secondary" className="hidden sm:inline-flex">3 campaigns</Badge>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card/55">
            <div className="grid grid-cols-[1fr_100px_90px_110px] gap-4 border-b border-border px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <span>캠페인</span><span>신청</span><span>방문</span><span>생성일</span>
            </div>
            {campaigns.map((campaign) => (
              <Link href="#" key={campaign.name} className="grid grid-cols-[1fr_100px_90px_110px] items-center gap-4 border-b border-border px-5 py-5 last:border-b-0 hover:bg-card">
                <div className="flex flex-col items-start gap-1.5">
                  <span className="font-semibold">{campaign.name}</span>
                  <Badge variant={campaign.status === "진행 중" ? "default" : "outline"}>{campaign.status}</Badge>
                </div>
                <span className="font-mono text-sm">{campaign.leads}</span>
                <span className="font-mono text-sm">{campaign.visits}</span>
                <span className="text-sm text-muted-foreground">{campaign.date}</span>
              </Link>
            ))}
          </div>
        </section>

        <aside id="overview" className="border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-8">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Overview</p>
          <div className="flex flex-col gap-7">
            <div><p className="text-sm text-muted-foreground">전체 신청</p><p className="mt-1 text-4xl font-bold tracking-tight">229</p></div>
            <div><p className="text-sm text-muted-foreground">전체 방문</p><p className="mt-1 text-4xl font-bold tracking-tight">1,448</p></div>
            <div><p className="text-sm text-muted-foreground">평균 전환율</p><p className="mt-1 text-4xl font-bold tracking-tight">15.8<span className="text-xl">%</span></p></div>
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
