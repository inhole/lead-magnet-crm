"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Counts = { visits: number; visitors: number; submissions: number; convertedVisitors: number }
type ChannelMetric = Counts & { channel: string }
type Metrics = { overall: Counts; channels: ChannelMetric[] }
type Submission = { submission_id: string; submitted_at: string; channel: string; values: Record<string, unknown> }
const LABELS: Record<string, string> = { instagram: "인스타그램", x: "X", youtube: "유튜브", threads: "스레드", direct: "직접 유입" }
const rate = (metric: Counts) => metric.visitors ? `${Math.round(metric.convertedVisitors / metric.visitors * 10000) / 100}%` : "0%"
const koreaTime = (value: string) => new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Seoul" }).format(new Date(value))

export function CampaignInsights({ id }: { id: string }) {
  const [metrics, setMetrics] = useState<Metrics | null>(null), [submissions, setSubmissions] = useState<Submission[] | null>(null)
  const [selected, setSelected] = useState<Submission | null>(null), [error, setError] = useState("")
  useEffect(() => { Promise.all([fetch(`/api/campaigns/${id}/metrics`), fetch(`/api/campaigns/${id}/submissions`)]).then(async responses => { const bodies = await Promise.all(responses.map(response => response.json())); const failed = responses.findIndex(response => !response.ok); if (failed >= 0) throw new Error(bodies[failed].message); setMetrics(bodies[0].metrics); setSubmissions(bodies[1].submissions) }).catch(reason => setError(reason instanceof Error ? reason.message : "CRM 정보를 불러오지 못했습니다.")) }, [id])
  async function openSubmission(submissionId: string) { setError(""); const response = await fetch(`/api/campaigns/${id}/submissions/${submissionId}`); const body = await response.json(); if (!response.ok) { setError(body.message); return } setSelected(body.submission) }
  if (error && !metrics) return <Alert variant="destructive"><AlertTitle>CRM 정보를 불러올 수 없습니다</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>
  if (!metrics || !submissions) return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Spinner /> 성과와 신청자를 불러오는 중입니다.</div>
  return <div className="flex flex-col gap-6">
    <section aria-labelledby="metric-title"><h2 id="metric-title" className="mb-3 text-lg font-semibold">성과 요약</h2><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><MetricCard title="방문" value={metrics.overall.visits} description="새로고침 포함" /><MetricCard title="고유 방문자" value={metrics.overall.visitors} description="브라우저 식별 기준" /><MetricCard title="신청" value={metrics.overall.submissions} description="정상 저장 건수" /><MetricCard title="전환율" value={rate(metrics.overall)} description="신청 고유 방문자 기준" /></div></section>
    <Card><CardHeader><CardTitle>채널 성과</CardTitle><CardDescription>채널별 고유 방문자 합은 캠페인 전체와 다를 수 있습니다.</CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>채널</TableHead><TableHead>방문</TableHead><TableHead>방문자</TableHead><TableHead>신청</TableHead><TableHead>전환율</TableHead></TableRow></TableHeader><TableBody>{metrics.channels.map(metric => <TableRow key={metric.channel}><TableCell><Badge variant="secondary">{LABELS[metric.channel]}</Badge></TableCell><TableCell>{metric.visits}</TableCell><TableCell>{metric.visitors}</TableCell><TableCell>{metric.submissions}</TableCell><TableCell>{rate(metric)}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
    <Card><CardHeader><CardTitle>신청자</CardTitle><CardDescription>최근 신청 100건을 한국 시간 기준으로 표시합니다.</CardDescription></CardHeader><CardContent>{submissions.length ? <Table><TableHeader><TableRow><TableHead>제출 시각</TableHead><TableHead>유입 채널</TableHead><TableHead className="text-right">상세</TableHead></TableRow></TableHeader><TableBody>{submissions.map(submission => <TableRow key={submission.submission_id}><TableCell>{koreaTime(submission.submitted_at)}</TableCell><TableCell><Badge variant="outline">{LABELS[submission.channel]}</Badge></TableCell><TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => openSubmission(submission.submission_id)}>입력값 보기</Button></TableCell></TableRow>)}</TableBody></Table> : <Empty><EmptyHeader><EmptyTitle>아직 신청자가 없습니다</EmptyTitle><EmptyDescription>배포 링크에서 신청이 접수되면 여기에 표시됩니다.</EmptyDescription></EmptyHeader></Empty>}{error ? <Alert variant="destructive" className="mt-4"><AlertTitle>신청 상세를 불러올 수 없습니다</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}</CardContent></Card>
    <Dialog open={!!selected} onOpenChange={open => { if (!open) setSelected(null) }}><DialogContent><DialogHeader><DialogTitle>신청 입력값</DialogTitle><DialogDescription>{selected ? `${koreaTime(selected.submitted_at)} · ${LABELS[selected.channel]}` : "신청 상세"}</DialogDescription></DialogHeader><dl className="flex max-h-80 flex-col gap-3 overflow-y-auto">{selected ? Object.entries(selected.values).map(([key, value]) => <div key={key} className="rounded-lg border p-3"><dt className="text-xs text-muted-foreground">{key}</dt><dd className="mt-1 break-words">{Array.isArray(value) ? value.join(", ") : typeof value === "boolean" ? (value ? "예" : "아니요") : String(value)}</dd></div>) : null}</dl></DialogContent></Dialog>
  </div>
}

function MetricCard({ title, value, description }: { title: string; value: number | string; description: string }) { return <Card size="sm"><CardHeader><CardDescription>{title}</CardDescription><CardTitle className="text-2xl">{value}</CardTitle></CardHeader><CardContent className="text-xs text-muted-foreground">{description}</CardContent></Card> }
