import { WorkspaceOverview } from "@/components/campaigns/workspace-overview"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function PerformancePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-10 px-6 py-10 lg:px-10 lg:py-14">
      <section aria-labelledby="performance-title">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Workspace / Performance</p>
        <h1 id="performance-title" className="text-4xl font-bold tracking-[-0.04em] lg:text-5xl">전체 성과</h1>
        <p className="mb-7 mt-3 text-muted-foreground">모든 캠페인의 방문과 신청 흐름을 한눈에 확인하세요.</p>
        <WorkspaceOverview />
      </section>
      <Card>
        <CardHeader>
          <CardTitle>지표 기준</CardTitle>
          <CardDescription>전체 캠페인에서 중복 방문을 제거해 성과를 계산합니다.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm text-muted-foreground sm:grid-cols-3">
          <p><strong className="text-foreground">고유 방문자</strong><br />브라우저 방문자 식별자 기준입니다.</p>
          <p><strong className="text-foreground">전체 신청</strong><br />정상적으로 저장된 신청 건수입니다.</p>
          <p><strong className="text-foreground">전체 전환율</strong><br />신청한 고유 방문자 ÷ 전체 고유 방문자입니다.</p>
        </CardContent>
      </Card>
    </main>
  )
}
