import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CampaignList } from "@/components/campaigns/campaign-list"
import { WorkspaceOverview } from "@/components/campaigns/workspace-overview"

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-12 px-6 py-10 lg:px-10 lg:py-14">
      <section id="overview" className="scroll-mt-28" aria-labelledby="overview-title">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Workspace / Overview</p>
        <h1 id="overview-title" className="text-4xl font-bold tracking-[-0.04em] lg:text-5xl">전체 성과</h1>
        <p className="mb-7 mt-3 text-muted-foreground">모든 캠페인의 방문과 신청 흐름을 한눈에 확인하세요.</p>
        <WorkspaceOverview />
      </section>

      <div className="grid gap-12 lg:grid-cols-[1fr_280px]">
        <section aria-labelledby="campaign-title">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Workspace / Campaigns</p>
              <h2 id="campaign-title" className="text-4xl font-bold tracking-[-0.04em]">캠페인</h2>
              <p className="mt-3 text-muted-foreground">리드마그넷의 흐름을 만들고, 신청 성과를 확인하세요.</p>
            </div>
          </div>

          <CampaignList />
        </section>

        <aside className="border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-8">
          <Card>
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
