"use client"

import { useEffect, useState } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

type Metrics = { campaigns: number; visits: number; visitors: number; submissions: number; convertedVisitors: number }

const conversionRate = (metrics: Metrics) => metrics.visitors
  ? `${Math.round(metrics.convertedVisitors / metrics.visitors * 10000) / 100}%`
  : "0%"

export function WorkspaceOverview() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/metrics")
      .then(async (response) => {
        const body = await response.json()
        if (!response.ok) throw new Error(body.message)
        setMetrics(body.metrics)
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "전체 성과를 불러오지 못했습니다."))
  }, [])

  if (error) return <Alert variant="destructive"><AlertTitle>전체 성과를 불러올 수 없습니다</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>
  if (!metrics) return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Spinner /> 전체 성과를 계산하는 중입니다.</div>

  const items = [
    ["캠페인", metrics.campaigns],
    ["전체 방문", metrics.visits],
    ["고유 방문자", metrics.visitors],
    ["전체 신청", metrics.submissions],
    ["전체 전환율", conversionRate(metrics)],
  ] as const

  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{items.map(([label, value]) => <Card key={label} size="sm"><CardHeader><CardDescription>{label}</CardDescription><CardTitle className="text-2xl">{value}</CardTitle></CardHeader></Card>)}</div>
}
